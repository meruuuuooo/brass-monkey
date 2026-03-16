<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\EnableTwoFactorAuthentication;
use App\Actions\Fortify\ResetUserPassword;
use App\Http\Requests\TwoFactor\EmailTwoFactorLoginRequest;
use App\Models\User;
use App\Notifications\TwoFactorOtpNotification;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Contracts\EnablesTwoFactorAuthentication;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\Http\Requests\TwoFactorLoginRequest;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(TwoFactorLoginRequest::class, EmailTwoFactorLoginRequest::class);
        $this->app->bind(EnablesTwoFactorAuthentication::class, EnableTwoFactorAuthentication::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request): Response => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request): Response => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request): Response => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request): Response => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn (): Response => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(function (Request $request): Response {
            $this->sendTwoFactorOtpEmail($request);

            return Inertia::render('auth/two-factor-challenge', [
                'emailHint' => $this->maskedEmail($request),
            ]);
        });

        Fortify::confirmPasswordView(fn (): Response => Inertia::render('auth/confirm-password'));
    }

    /**
     * Send a one-time email OTP for the challenged user (once per session challenge).
     */
    private function sendTwoFactorOtpEmail(Request $request): void
    {
        $userId = $request->session()->get('login.id');

        if (! $userId) {
            return;
        }

        $sessionKey = "two_factor_otp_sent.{$userId}";

        if ($request->session()->has($sessionKey)) {
            return;
        }

        $user = User::find($userId);

        if (! $user) {
            return;
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put("two_factor_otp.{$userId}", $otp, now()->addMinutes(10));
        $request->session()->put($sessionKey, true);

        $user->notify(new TwoFactorOtpNotification($otp));
    }

    /**
     * Return a masked email address for the challenged user.
     */
    private function maskedEmail(Request $request): ?string
    {
        $userId = $request->session()->get('login.id');
        $user = $userId ? User::find($userId) : null;

        if (! $user) {
            return null;
        }

        [$local, $domain] = explode('@', $user->email, 2);
        $masked = substr($local, 0, 2).str_repeat('*', max(0, strlen($local) - 2));

        return "{$masked}@{$domain}";
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
