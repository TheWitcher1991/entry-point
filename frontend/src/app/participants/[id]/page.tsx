"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  getParticipantPublicProfile,
  getParticipantPublicReviews,
} from "@entities/participant";
import type { Review } from "@entities/review";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  ChevronRight,
  MapPin,
  Briefcase,
  User,
  ExternalLink,
  MessageSquare,
  Star,
  Bookmark,
} from "@shared/ui/Icons";

const LIGHT_BG_COLORS = [
  "bg-[#E8F4F4] text-primary",
  "bg-[#FFF3E0] text-[#E65100]",
  "bg-[#E3F2FD] text-[#0D47A1]",
  "bg-[#F3E5F5] text-[#4A148C]",
  "bg-[#E8F5E9] text-[#1B5E20]",
  "bg-[#FBE9E7] text-[#BF360C]",
  "bg-[#FCE4EC] text-[#880E4F]",
  "bg-[#E0F7FA] text-[#00695C]",
];

function getAvatarColor(id: number): string {
  return LIGHT_BG_COLORS[id % LIGHT_BG_COLORS.length];
}

function getInitials(first: string | null, last: string | null): string {
  return [first?.[0], last?.[0]].filter(Boolean).join("") || "?";
}

function getFullName(first: string | null, last: string | null): string {
  return [first, last].filter(Boolean).join(" ") || "Участник";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={star <= rating ? "#F59E0B" : "none"}
          stroke={star <= rating ? "#F59E0B" : "currentColor"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function PublicParticipantPage() {
  const params = useParams();
  const participantId = parseInt(params.id as string, 10);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["participant-public-profile", participantId],
    queryFn: () => getParticipantPublicProfile(participantId),
    enabled: !isNaN(participantId),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["participant-public-reviews", participantId],
    queryFn: () => getParticipantPublicReviews(participantId),
    enabled: !isNaN(participantId),
  });

  if (isNaN(participantId)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Участник не найден</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 max-w-[1200px] mx-auto px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-muted rounded-[12px]" />
            <div className="p-8 rounded-[24px] bg-card border border-border">
              <div className="flex gap-8">
                <div className="w-24 h-24 rounded-[20px] bg-muted/70" />
                <div className="flex-1 space-y-3">
                  <div className="h-8 w-1/2 bg-muted/70 rounded-[8px]" />
                  <div className="h-4 w-1/3 bg-muted/50 rounded-[6px]" />
                  <div className="h-4 w-2/3 bg-muted/50 rounded-[6px]" />
                </div>
              </div>
            </div>
            <div className="h-64 rounded-[24px] bg-muted/40" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Участник не найден</p>
        </div>
        <Footer />
      </div>
    );
  }

  const initials = getInitials(profile.first_name, profile.last_name);
  const fullName = getFullName(profile.first_name, profile.last_name);
  const avatarColor = getAvatarColor(profile.id);
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s: number, r: Review) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;

  const hasLinks = profile.github_url || profile.telegram || profile.portfolio_url;
  const hasDetails = profile.city || profile.specialty || profile.desired_role;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumbs */}
      <div className="border-b border-border pt-6">
        <div className="max-w-[1200px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors no-underline">
              Главная
            </Link>
            <ChevronRight size={14} className="text-muted-foreground" />
            <span className="text-foreground">{fullName}</span>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <section className="pt-10 pb-0">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="p-8 rounded-[24px] bg-card border border-border">
            <div className="flex gap-8 items-start">
              {/* Avatar */}
              <div className={`w-24 h-24 rounded-[20px] flex items-center justify-center text-[42px] font-bold shrink-0 ${avatarColor}`}>
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-[32px] font-bold font-display text-foreground mb-2">
                  {fullName}
                </h1>

                {hasDetails && (
                  <div className="flex items-center gap-4 text-[14px] text-muted-foreground mb-4 flex-wrap">
                    {profile.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={16} />
                        {profile.city}
                      </span>
                    )}
                    {profile.specialty && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={16} />
                        {profile.specialty}
                      </span>
                    )}
                    {profile.desired_role && (
                      <span className="flex items-center gap-1.5">
                        <User size={16} />
                        {profile.desired_role}
                      </span>
                    )}
                  </div>
                )}

                {/* Bio */}
                {profile.bio && (
                  <p className="text-muted-foreground leading-relaxed max-w-[640px] mb-6">
                    {profile.bio}
                  </p>
                )}

                {/* Rating */}
                {avgRating && (
                  <div className="flex items-center gap-2 mb-6">
                    <StarRating rating={Math.round(avgRating)} />
                    <span className="text-[14px] font-semibold text-foreground">{avgRating}</span>
                    <span className="text-[13px] text-muted-foreground">
                      · {reviews.length} {reviews.length === 1 ? "отзыв" : reviews.length < 5 ? "отзыва" : "отзывов"}
                    </span>
                  </div>
                )}

                {/* Links */}
                {hasLinks && (
                  <div className="flex gap-3 flex-wrap">
                    {profile.github_url && (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-[40px] px-5 text-[13px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[12px] transition-colors no-underline"
                      >
                        <ExternalLink size={16} />
                        GitHub
                      </a>
                    )}
                    {profile.telegram && (
                      <a
                        href={profile.telegram.startsWith("http") ? profile.telegram : `https://t.me/${profile.telegram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-[40px] px-5 text-[13px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[12px] transition-colors no-underline"
                      >
                        <ExternalLink size={16} />
                        Telegram
                      </a>
                    )}
                    {profile.portfolio_url && (
                      <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-[40px] px-5 text-[13px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[12px] transition-colors no-underline"
                      >
                        <ExternalLink size={16} />
                        Портфолио
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-[20px] bg-card border border-border text-center">
              <Star size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-[28px] font-bold font-display text-primary tabular-nums">
                {reviews.length}
              </div>
              <div className="text-[13px] text-muted-foreground mt-1">Отзывов</div>
            </div>
            <div className="p-5 rounded-[20px] bg-card border border-border text-center">
              <Bookmark size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-[28px] font-bold font-display text-primary tabular-nums">
                {profile.education || "—"}
              </div>
              <div className="text-[13px] text-muted-foreground mt-1">Образование</div>
            </div>
            <div className="p-5 rounded-[20px] bg-card border border-border text-center">
              <MapPin size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-[28px] font-bold font-display text-primary tabular-nums">
                {profile.city || "—"}
              </div>
              <div className="text-[13px] text-muted-foreground mt-1">Город</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="pb-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare size={20} strokeWidth={1.5} className="text-primary" />
            <h2 className="text-[22px] font-bold font-display text-foreground">Отзывы</h2>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
              {reviews.length}
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[15px] text-muted-foreground">У участника пока нет отзывов</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review: Review) => {
                const companyInitials = review.company_name?.[0] || "?";
                const companyColor = getAvatarColor(review.company_id);
                const skills = review.skills_confirmed
                  ? review.skills_confirmed.split(",").map((s) => s.trim())
                  : [];

                return (
                  <div key={review.id} className="p-6 rounded-[24px] bg-card border border-border">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 ${companyColor}`}>
                        {companyInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] text-foreground">
                          {review.company_name || "Компания"}
                        </div>
                        {review.task_title && (
                          <div className="text-[12px] text-muted-foreground truncate">
                            Задача: {review.task_title}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        <StarRating rating={review.rating} />
                      </div>
                    </div>

                    {review.text && (
                      <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
                        {review.text}
                      </p>
                    )}

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center h-6 px-2 rounded-full text-[12px] font-medium bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
