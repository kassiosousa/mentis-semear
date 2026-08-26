<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabela `user_notifications` (e não `notifications`) para não colidir com o
        // trait Notifiable do Laravel presente no model User.
        Schema::create('user_notifications', function (Blueprint $table): void {
            $table->id();
            // Alvo: um usuário específico (user_id) OU um tipo de usuário (user_type).
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_type')->nullable(); // admin | usuario | facilitador | empresa
            $table->string('title');
            $table->text('message');
            $table->string('event')->nullable(); // ex.: workshop.created
            $table->string('status')->default('new'); // new | read
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notifications');
    }
};
