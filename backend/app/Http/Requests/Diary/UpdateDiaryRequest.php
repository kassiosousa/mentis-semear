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
            // Reenviar um arquivo substitui o anterior.
            'file_1' => ['sometimes', 'nullable', 'file', 'max:5120', 'mimes:jpg,jpeg,png,webp,pdf,doc,docx'],
            'file_2' => ['sometimes', 'nullable', 'file', 'max:5120', 'mimes:jpg,jpeg,png,webp,pdf,doc,docx'],
        ];
    }
}
