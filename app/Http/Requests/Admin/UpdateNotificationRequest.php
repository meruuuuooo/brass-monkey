<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'action' => ['nullable', 'in:send,cancel'],
            'title' => ['required_without:action', 'string', 'max:255'],
            'message' => ['required_without:action', 'string', 'max:2000'],
            'type' => ['required_without:action', 'in:system,promotional,alert,info'],
            'target' => ['required_without:action', 'in:all,admins,clients'],
            'channel' => ['required_without:action', 'in:in_app,email,both'],
        ];
    }
}
