<?php

declare(strict_types=1);

namespace App\Http\Requests\DiaryEvidence;

use Illuminate\Foundation\Http\FormRequest;

final class StoreDiaryEvidenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        // user_creator_id vem do usuário autenticado.
        return [
            'diary_id' => ['required', 'integer', 'exists:diaries,id'],
            'link' => ['required', 'string', 'url', 'max:2048'],
        ];
    }
}
