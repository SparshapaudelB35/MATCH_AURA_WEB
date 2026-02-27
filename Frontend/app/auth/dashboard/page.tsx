import { handleDiscoverUsers, handleWhoAmI } from "@/lib/actions/auth-action";
import { notFound, redirect } from "next/navigation";
import DiscoverDeck from "../_components/DiscoverDeck";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
export const dynamic = "force-dynamic";

type DiscoverUser = {
  _id: string;
  username?: string;
  gender?: string;
  dateOfBirth?: string;
  bio?: string;
  interests?: string[];
  imageUrl?: string;
  profileImages?: string[];
};

const isOnboardingComplete = (user: any) => {
  return Boolean(
    user?.onboardingCompleted &&
      user?.username &&
      user?.dateOfBirth &&
      user?.gender &&
      user?.bio &&
      Array.isArray(user?.interests) &&
      user.interests.length > 0 &&
      user?.imageUrl &&
      Array.isArray(user?.profileImages) &&
      user.profileImages.length > 0
  );
};

const getOppositeGender = (gender?: string) => {
  const normalized = String(gender || "").toLowerCase();
  if (normalized === "male") return "female";
  if (normalized === "female") return "male";
  return undefined;
};

export default async function DashboardPage() {
  const profileResult = await handleWhoAmI();

  if (!profileResult.success || !profileResult.data) {
    notFound();
  }

  const me = profileResult.data;

  if (me.role !== "admin" && !isOnboardingComplete(me)) {
    redirect("/auth/profile");
  }

  const targetGender = getOppositeGender(me.gender);
  const discoverResult = await handleDiscoverUsers(targetGender);
  const users: DiscoverUser[] = discoverResult.success ? discoverResult.data : [];

  return (
    <main className="relative min-h-screen bg-white">
      <DiscoverDeck
        users={users}
        apiBaseUrl={API_BASE_URL}
        me={{
          name: me.username,
          firstName: me.firstName,
          lastName: me.lastName,
          email: me.email,
          imageUrl: me.imageUrl,
          username: me.username,
          gender: me.gender,
          dateOfBirth: me.dateOfBirth,
          bio: me.bio,
          interests: me.interests,
          profileImages: me.profileImages,
        }}
      />
    </main>
  );
}
