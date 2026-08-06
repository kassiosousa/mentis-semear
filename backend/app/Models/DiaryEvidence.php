<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiaryEvidence extends Model
{
    use HasFactory;

    protected $table = 'diary_evidences';

    /** @var list<string> */
    protected $fillable = ['diary_id', 'user_creator_id', 'link'];

    public function diary(): BelongsTo
    {
        return $this->belongsTo(Diary::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_creator_id');
    }
}
