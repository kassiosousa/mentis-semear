<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\UserType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Notificação interna. Alvo é um usuário específico (user_id) OU um tipo (user_type).
 * Começa com status "new"; o front envia "read" quando o usuário lê.
 */
class Notification extends Model
{
    use HasFactory;

    protected $table = 'user_notifications';

    public const STATUS_NEW = 'new';

    public const STATUS_READ = 'read';

    /** @var list<string> */
    protected $fillable = ['user_id', 'user_type', 'title', 'message', 'event', 'status'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Notificações visíveis ao usuário: as dele (user_id) ou do tipo dele (user_type). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where(function (Builder $q) use ($user): void {
            $q->where('user_id', $user->id)
                ->orWhere('user_type', $user->type->value);
        });
    }

    /** Cria uma notificação para um usuário específico (ignora se o id for nulo). */
    public static function forUserId(?string $userId, string $title, string $message, ?string $event = null): ?self
    {
        if ($userId === null) {
            return null;
        }

        return static::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'event' => $event,
            'status' => self::STATUS_NEW,
        ]);
    }

    /** Cria uma notificação para todos os usuários de um tipo. */
    public static function forType(UserType $type, string $title, string $message, ?string $event = null): self
    {
        return static::create([
            'user_type' => $type->value,
            'title' => $title,
            'message' => $message,
            'event' => $event,
            'status' => self::STATUS_NEW,
        ]);
    }
}
