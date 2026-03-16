<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Fortify\Features;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->skipUnlessFortifyFeature(Features::twoFactorAuthentication());
});

test('user with email otp enabled is redirected to two factor challenge on login', function () {
    $user = User::factory()->create();
    $user->forceFill([
        'two_factor_secret' => encrypt('EMAIL_OTP'),
        'two_factor_recovery_codes' => null,
        'two_factor_confirmed_at' => now(),
    ])->save();

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('two-factor.login'));

    $this->assertGuest();
});

test('valid email otp code authenticates the user', function () {
    $user = User::factory()->create();
    $user->forceFill([
        'two_factor_secret' => encrypt('EMAIL_OTP'),
        'two_factor_recovery_codes' => null,
        'two_factor_confirmed_at' => now(),
    ])->save();

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $otp = '123456';
    Cache::put("two_factor_otp.{$user->id}", $otp, now()->addMinutes(10));

    $this->post(route('two-factor.login'), ['code' => $otp])
        ->assertRedirect();

    $this->assertAuthenticated();
});

test('invalid email otp code rejects authentication', function () {
    $user = User::factory()->create();
    $user->forceFill([
        'two_factor_secret' => encrypt('EMAIL_OTP'),
        'two_factor_recovery_codes' => null,
        'two_factor_confirmed_at' => now(),
    ])->save();

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    Cache::put("two_factor_otp.{$user->id}", '999999', now()->addMinutes(10));

    $this->post(route('two-factor.login'), ['code' => '000000'])
        ->assertRedirect(route('two-factor.login'));

    $this->assertGuest();
});

test('otp is consumed after successful verification', function () {
    $user = User::factory()->create();
    $user->forceFill([
        'two_factor_secret' => encrypt('EMAIL_OTP'),
        'two_factor_recovery_codes' => null,
        'two_factor_confirmed_at' => now(),
    ])->save();

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $otp = '555555';
    Cache::put("two_factor_otp.{$user->id}", $otp, now()->addMinutes(10));

    $this->post(route('two-factor.login'), ['code' => $otp]);

    expect(Cache::has("two_factor_otp.{$user->id}"))->toBeFalse();
});
