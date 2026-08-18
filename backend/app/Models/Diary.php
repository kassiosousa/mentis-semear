<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Diary extends Model
{
    use HasFactory;

    protected $table = 'diaries';

    // file_1/file_2 ficam fora do fillable: são gravados pelo controller ao subir o arquivo.
    /** @var list<string> */
    protected $fillable = ['workshop_id', 'user_creator_id', 'title', 'description', 'datetime'];

    /** URLs de download prontas para o front. */
    protected $appends = ['file_1_url', 'file_2_url'];

    protected static function booted(): void
    {
        // Remove os arquivos físicos ao excluir o diário.
        static::deleting(function (Diary $diary): void {
            foreach ([$diary->file_1, $diary->file_2] as $path) {
                if ($path) {
                    Storage::disk('local')->delete($path);
                }
            }
        });
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['datetime' => 'datetime'];
    }

    public function getFile1UrlAttribute(): ?string
    {
        return $this->file_1 ? url("/api/diaries/{$this->id}/files/1") : null;
    }

    public function getFile2UrlAttribute(): ?string
    {
        return $this->file_2 ? url("/api/diaries/{$this->id}/files/2") : null;
    }

    public function workshop(): BelongsTo
    {
        return $this->belongsTo(Workshop::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_creator_id');
    }

    public function evidences(): HasMany
    {
        return $this->hasMany(DiaryEvidence::class);
    }
}
