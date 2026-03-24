<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('user can upload an avatar', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->avatar)->not->toBeNull();
    Storage::disk('public')->assertExists($user->getRawOriginal('avatar'));
});

test('previous avatar is deleted when a new one is uploaded', function () {
    Storage::fake('public');

    $user = User::factory()->create([
        'avatar' => 'avatars/old-avatar.jpg',
    ]);

    // Create the old file
    Storage::disk('public')->put('avatars/old-avatar.jpg', 'content');

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->image('new-avatar.jpg'),
        ]);

    $response->assertSessionHasNoErrors();

    $user->refresh();

    Storage::disk('public')->assertMissing('avatars/old-avatar.jpg');
    Storage::disk('public')->assertExists($user->getRawOriginal('avatar'));
});

test('avatar must be an image', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->create('not-an-image.pdf'),
        ]);

    $response->assertSessionHasErrors('avatar');
    expect($user->refresh()->avatar)->toBeNull();
});

test('avatar cannot be too large', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->image('large-avatar.jpg')->size(3000), // 3MB > 2MB limit
        ]);

    $response->assertSessionHasErrors('avatar');
    expect($user->refresh()->avatar)->toBeNull();
});
