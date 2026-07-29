import { CompanyProfileForm } from "@features/company-profile";

export default function CompanyProfilePage() {
  return (
    <div>
      <h1 className="text-[28px] font-semibold mb-2">Профиль компании</h1>
      <p className="text-[15px] text-muted-foreground mb-8">
        Расскажите о вашей компании, чтобы участники могли вас найти
      </p>

      <div className="rounded-[24px] bg-card border border-border p-8">
        <CompanyProfileForm />
      </div>
    </div>
  );
}
