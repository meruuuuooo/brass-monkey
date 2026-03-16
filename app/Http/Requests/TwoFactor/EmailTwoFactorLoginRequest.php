<?php

namespace App\Http\Requests\TwoFactor;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Laravel\Fortify\Http\Requests\TwoFactorLoginRequest;

class EmailTwoFactorLoginRequest extends TwoFactorLoginRequest
{
    /**
     * Determine if the provided two-factor authentication code is valid.
     *
     * Uses a cached email OTP rather than a TOTP secret.
     */
    public function hasValidCode(): bool
    {
        $user = $this->challengedUser();

        if (! $user instanceof User) {
            return false;
        }

        $input = $this->input('code');

        if (! $input || strlen($input) !== 6) {
            return false;
        }

        $cacheKey = "two_factor_otp.{$user->id}";
        $stored = Cache::get($cacheKey);

        if (! $stored || ! hash_equals((string) $stored, (string) $input)) {
            return false;
        }

        Cache::forget($cacheKey);

        return true;
    }

    /**
     * Validate the recovery code — not supported with email OTP.
     */
    public function hasValidRecoveryCode(): bool
    {
        return false;
    }
}
