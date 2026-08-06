<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workshops', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->restrictOnDelete();
            $table->foreignUuid('user_creator_id')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('user_facilitator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('datetime');
            $table->string('address');
            $table->string('checkin_link');
            $table->string('assessment_link');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workshops');
    }
};
