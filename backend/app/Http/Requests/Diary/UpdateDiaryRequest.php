<?php

declare(strict_types=1);

namespace App\Http\Requests\Diary;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateDiaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        // workshop_id é imutável (relação 1:1 definida na criação).
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'datetime' => ['sometimes', 'required', 'date'],
        ];
    }
}
