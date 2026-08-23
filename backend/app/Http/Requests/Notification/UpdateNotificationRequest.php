<?php

declare(strict_types=1);

namespace App\Http\Requests\Notification;

use App\Models\Notification;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in([Notification::STATUS_NEW, Notification::STATUS_READ])],
        ];
    }
}
