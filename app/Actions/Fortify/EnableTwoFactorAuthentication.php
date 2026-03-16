<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Laravel\Fortify\Contracts\EnablesTwoFactorAuthentication;

class EnableTwoFactorAuthentication implements EnablesTwoFactorAuthentication
{
    /**
     * Enable two-factor authentication for the user using email OTP.
     *
     * Instead of a TOTP secret, we store a sentinel value so Fortify recognises
     * the user as having 2FA enabled. Codes are delivered by email on each login.
     */
    public function __invoke(mixed $user, bool $force = false): void
    {
        /** @var User $user */
        if ($force || ! $user->hasEnabledTwoFactorAuthentication()) {
            $user->forceFill([
                'two_factor_secret' => 'EMAIL_OTP',
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => now(),
            ])->save();
        }
    }
}
