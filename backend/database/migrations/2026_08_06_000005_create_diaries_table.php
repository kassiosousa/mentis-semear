<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diaries', function (Blueprint $table): void {
            $table->id();
            // 1:1 com workshop -> workshop_id único.
            $table->foreignId('workshop_id')->unique()->constrained('workshops')->cascadeOnDelete();
            $table->foreignUuid('user_creator_id')->constrained('users')->restrictOnDelete();
            $table->string('title');
            $table->text('description');
            $table->dateTime('datetime');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diaries');
    }
};
