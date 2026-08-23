<?php

declare(strict_types=1);

namespace App\Http\Requests\User;

use App\Enums\UserType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

final class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes', 'required', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($this->route('user')),
            ],
            'password' => ['sometimes', 'required', 'string', 'min:8'],
            'type' => ['sometimes', 'required', new Enum(UserType::class)],
            'company_id' => [
                'sometimes',
                Rule::requiredIf(fn (): bool => $this->input('type') === UserType::Empresa->value),
                'nullable', 'integer', 'exists:companies,id',
            ],
        ];
    }
}
