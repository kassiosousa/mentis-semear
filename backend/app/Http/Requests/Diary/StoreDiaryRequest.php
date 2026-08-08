<?php

declare(strict_types=1);

namespace App\Http\Requests\Diary;

use Illuminate\Foundation\Http\FormRequest;

final class StoreDiaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        // 1:1 — cada workshop só pode ter um diário (user_creator_id vem do usuário autenticado).
        return [
            'workshop_id' => ['required', 'integer', 'exists:workshops,id', 'unique:diaries,workshop_id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'datetime' => ['required', 'date'],
        ];
    }
}
