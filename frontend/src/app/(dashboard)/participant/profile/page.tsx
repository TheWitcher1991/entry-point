import { ParticipantProfileForm } from "@features/participant-profile";

export default function ParticipantProfilePage() {
  return (
    <div>
      <h1 className="text-[28px] font-semibold mb-2">Профиль участника</h1>
      <p className="text-[15px] text-muted-foreground mb-8">
        Заполните информацию о себе, чтобы компании могли вас найти
      </p>

      <div className="rounded-[24px] bg-card border border-border p-8">
        <ParticipantProfileForm />
      </div>
    </div>
  );
}
