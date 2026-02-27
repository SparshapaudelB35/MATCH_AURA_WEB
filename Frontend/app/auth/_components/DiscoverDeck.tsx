"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

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

type MatchUser = {
  _id: string;
  username?: string;
  imageUrl?: string;
};

type ChatMessage = {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
};

type MeProfile = {
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  username?: string;
  gender?: string;
  dateOfBirth?: string;
  bio?: string;
  interests?: string[];
  profileImages?: string[];
};

type SelectedGalleryItem = {
  file: File;
  preview: string;
};

type Props = {
  users: DiscoverUser[];
  apiBaseUrl: string;
  onLike?: (user: DiscoverUser) => void;
  onDislike?: (user: DiscoverUser) => void;
  me?: MeProfile;
};

const getAge = (dateOfBirth?: string) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
};

export default function TinderStyleDashboard({
  users,
  apiBaseUrl,
  onLike,
  onDislike,
  me,
}: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fly, setFly] = useState<null | "left" | "right">(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"discover" | "my-profile" | "messages">("discover");

  const [myProfile, setMyProfile] = useState<MeProfile>(me || {});
  const [myImageFile, setMyImageFile] = useState<File | undefined>(undefined);
  const [myProfilePreview, setMyProfilePreview] = useState<string | null>(null);
  const [myExistingGallery, setMyExistingGallery] = useState<string[]>(me?.profileImages || []);
  const [mySelectedGallery, setMySelectedGallery] = useState<SelectedGalleryItem[]>([]);
  const [myInterestsInput, setMyInterestsInput] = useState((me?.interests || []).join(", "));
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);

  const startRef = useRef<{ x: number; y: number; left: number; width: number } | null>(null);

  const SWIPE_THRESHOLD = 130;
  const TAP_THRESHOLD = 8;
  const MAX_GALLERY_IMAGES = 6;

  const current = users[index];
  const next = users[index + 1];

  const currentAge = useMemo(() => getAge(current?.dateOfBirth), [current?.dateOfBirth]);
  const myAge = useMemo(() => getAge(myProfile?.dateOfBirth), [myProfile?.dateOfBirth]);

  const imageGallery = useMemo(() => {
    const images = (current?.profileImages || []).filter(Boolean);
    if (images.length === 0 && current?.imageUrl) return [current.imageUrl];
    return images;
  }, [current?.profileImages, current?.imageUrl]);
  const coverImage = imageGallery[galleryIndex] || null;

  useEffect(() => {
    setMyProfile(me || {});
    setMyExistingGallery(me?.profileImages || []);
    setMySelectedGallery([]);
    setMyImageFile(undefined);
    setMyProfilePreview(null);
    setMyInterestsInput((me?.interests || []).join(", "));
    setProfileMessage(null);
  }, [me]);

  useEffect(() => {
    setDx(0);
    setDy(0);
    setIsDragging(false);
    setFly(null);
    setGalleryIndex(0);
    startRef.current = null;
  }, [index]);

  const goNext = () => setIndex((p) => Math.min(p + 1, users.length));

  const persistSwipe = async (targetUserId: string, action: "like" | "dislike") => {
    try {
      await fetch("/api/auth/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action }),
      });
    } catch (error) {
      console.error("Swipe persist failed", error);
    }
  };

  const showNextImage = () => {
    if (imageGallery.length <= 1) return;
    setGalleryIndex((prev) => (prev + 1) % imageGallery.length);
  };

  const showPrevImage = () => {
    if (imageGallery.length <= 1) return;
    setGalleryIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length);
  };

  const dislike = () => {
    if (!current || fly) return;
    setFly("left");
    window.setTimeout(async () => {
      await persistSwipe(current._id, "dislike");
      onDislike?.(current);
      goNext();
    }, 170);
  };

  const like = () => {
    if (!current || fly) return;
    setFly("right");
    window.setTimeout(async () => {
      await persistSwipe(current._id, "like");
      onLike?.(current);
      goNext();
    }, 170);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!current || fly || viewMode !== "discover") return;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    startRef.current = { x: e.clientX, y: e.clientY, left: rect.left, width: rect.width };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !startRef.current || fly || viewMode !== "discover") return;
    setDx(e.clientX - startRef.current.x);
    setDy(e.clientY - startRef.current.y);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging || fly || viewMode !== "discover") return;
    setIsDragging(false);

    const start = startRef.current;
    if (!start) return;

    const totalDx = e.clientX - start.x;
    const totalDy = e.clientY - start.y;
    const isTap = Math.abs(totalDx) < TAP_THRESHOLD && Math.abs(totalDy) < TAP_THRESHOLD;

    if (isTap && imageGallery.length > 1) {
      if (e.clientX > start.left + start.width / 2) showNextImage();
      else showPrevImage();
      setDx(0);
      setDy(0);
      return;
    }

    if (dx > SWIPE_THRESHOLD) like();
    else if (dx < -SWIPE_THRESHOLD) dislike();
    else {
      setDx(0);
      setDy(0);
    }
  };

  const rotation = Math.max(-18, Math.min(18, dx / 12));
  const likeOpacity = Math.max(0, Math.min(1, dx / SWIPE_THRESHOLD));
  const nopeOpacity = Math.max(0, Math.min(1, -dx / SWIPE_THRESHOLD));

  const transform = fly
    ? `translateX(${fly === "right" ? 900 : -900}px) translateY(${dy}px) rotate(${fly === "right" ? 20 : -20}deg)`
    : `translateX(${dx}px) translateY(${dy}px) rotate(${rotation}deg)`;

  const transition = fly
    ? "transform 170ms ease-out"
    : isDragging
      ? "transform 0ms"
      : "transform 220ms cubic-bezier(.2,.8,.2,1)";

  const meName = myProfile?.username || myProfile?.name || "Name";
  const myProfileImage = myProfilePreview || (myProfile?.imageUrl ? `${apiBaseUrl}${myProfile.imageUrl}` : null);

  const onMyProfileFieldChange = (
    key: Exclude<keyof MeProfile, "interests" | "profileImages">,
    value: string
  ) => {
    setMyProfile((prev) => ({ ...prev, [key]: value }));
  };

  const onMyImageChange = (file: File | undefined) => {
    setMyImageFile(file);
    if (!file) {
      setMyProfilePreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setMyProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addMyGalleryImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const available = MAX_GALLERY_IMAGES - myExistingGallery.length - mySelectedGallery.length;
    if (available <= 0) return;

    const acceptedFiles = Array.from(files).slice(0, available);
    const newItems = await Promise.all(
      acceptedFiles.map(
        (file) =>
          new Promise<SelectedGalleryItem>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ file, preview: reader.result as string });
            reader.readAsDataURL(file);
          })
      )
    );

    setMySelectedGallery((prev) => [...prev, ...newItems]);
  };

  const removeMyExistingGalleryImage = (indexToRemove: number) => {
    setMyExistingGallery((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeMySelectedGalleryImage = (indexToRemove: number) => {
    setMySelectedGallery((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const submitMyProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const formData = new FormData();
      if (myProfile.firstName) formData.append("firstName", myProfile.firstName);
      if (myProfile.lastName) formData.append("lastName", myProfile.lastName);
      if (myProfile.email) formData.append("email", myProfile.email);
      if (myProfile.username) formData.append("username", myProfile.username);
      if (myProfile.dateOfBirth) formData.append("dateOfBirth", myProfile.dateOfBirth);
      if (myProfile.gender) formData.append("gender", myProfile.gender);
      formData.append("interests", myInterestsInput);
      if (myProfile.bio) formData.append("bio", myProfile.bio);

      if (myImageFile) formData.append("image", myImageFile);
      formData.append("retainedProfileImages", JSON.stringify(myExistingGallery));
      mySelectedGallery.forEach((item) => formData.append("profileImages", item.file));

      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update profile");
      }

      const updatedUser = result.data as MeProfile;
      setMyProfile((prev) => ({
        ...prev,
        ...updatedUser,
        interests: updatedUser.interests || [],
      }));
      setMyInterestsInput((updatedUser.interests || []).join(", "));
      setMyExistingGallery(updatedUser.profileImages || []);
      setMySelectedGallery([]);
      setMyImageFile(undefined);
      setMyProfilePreview(null);
      setProfileMessage("Profile updated successfully");
      router.refresh();
    } catch (error: any) {
      setProfileMessage(error.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const selectedMatch = matches.find((match) => match._id === selectedMatchId);

  const fetchMatches = async () => {
    setMessagesLoading(true);
    try {
      const response = await fetch("/api/auth/matches", { cache: "no-store" });
      const result = await response.json();
      if (response.ok && result.success) {
        const fetchedMatches: MatchUser[] = (result.data || []).map((match: any) => ({
          ...match,
          _id: String(match._id),
        }));
        setMatches(fetchedMatches);
        if (fetchedMatches.length > 0) {
          setSelectedMatchId((prev) => prev || fetchedMatches[0]._id);
        } else {
          setSelectedMatchId("");
          setMessages([]);
        }
      }
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedMatchId && matches.length > 0) {
      setSelectedMatchId(matches[0]._id);
    }
  }, [matches, selectedMatchId]);

  const fetchMessages = async (otherUserId: string) => {
    setMessagesLoading(true);
    try {
      const response = await fetch(`/api/auth/messages/${otherUserId}`, { cache: "no-store" });
      const result = await response.json();
      if (response.ok && result.success) {
        setMessages(result.data || []);
      } else {
        setMessages([]);
      }
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    const content = messageInput.trim();
    if (!content || !selectedMatchId) return;
    const response = await fetch(`/api/auth/messages/${selectedMatchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const result = await response.json();
    if (response.ok && result.success) {
      setMessages((prev) => [...prev, result.data]);
      setMessageInput("");
    }
  };

  useEffect(() => {
    if (viewMode === "messages") {
      void fetchMatches();
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === "messages" && selectedMatchId) {
      void fetchMessages(selectedMatchId);
    }
  }, [viewMode, selectedMatchId]);

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <div className="h-full w-full px-4 py-4">
        <div className="grid h-full gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="flex h-full flex-col rounded-3xl border-2 border-fuchsia-500/40 bg-white p-4">
            <button
              type="button"
              onClick={() => setViewMode("my-profile")}
              className={`w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 p-3 text-white shadow transition ${viewMode === "my-profile" ? "ring-2 ring-fuchsia-300" : ""
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full bg-white/20">
                  {myProfileImage ? (
                    <Image src={myProfileImage} alt="My profile" fill className="object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs font-semibold">ME</div>
                  )}
                </div>
                <p className="truncate text-sm font-extrabold">{meName}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("discover")}
              className={`mt-3 w-full rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition ${viewMode === "discover"
                  ? "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800"
                  : "border-zinc-200 bg-white text-zinc-700"
                }`}
            >
              Discover Users
            </button>

            <button
              type="button"
              onClick={() => setViewMode("messages")}
              className={`mt-3 w-full rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition ${viewMode === "messages"
                  ? "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800"
                  : "border-zinc-200 bg-white text-zinc-700"
                }`}
            >
              Messages
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-auto rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-2 text-sm font-extrabold text-white shadow-lg shadow-fuchsia-200 transition hover:brightness-110"
            >
              Logout
            </button>
          </aside>

          <main className="h-full overflow-hidden rounded-3xl border-2 border-fuchsia-500/40 bg-white p-4">
            {viewMode === "messages" ? (
              <div className="h-full w-full rounded-3xl border border-zinc-200 bg-white/80 p-4 shadow-xl backdrop-blur sm:p-6">
  <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
    {/* LEFT: Matches */}
    <aside className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-zinc-50/60 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-sm font-extrabold tracking-tight text-zinc-900">Matches</p>
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-700">
          {matches.length}
        </span>
      </div>

      {/* Optional search (only UI) */}
      <div className="mb-3 px-1">
        <input
          placeholder="Search matches..."
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900
            placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600">
            No matches yet.
            <div className="mt-1 text-xs text-zinc-500">When you match, chats will show here.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((match) => {
              const active = selectedMatchId === match._id;

              return (
                <button
                  key={match._id}
                  type="button"
                  onClick={() => setSelectedMatchId(match._id)}
                  className={[
                    "group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition",
                    active
                      ? "border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-rose-50 ring-2 ring-fuchsia-200"
                      : "border-zinc-200 bg-white hover:border-rose-200 hover:bg-rose-50/40",
                  ].join(" ")}
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-zinc-200">
                    {match.imageUrl ? (
                      <Image
                        src={`${apiBaseUrl}${match.imageUrl}`}
                        alt={match.username || "Match"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-600">
                        {(match.username || "U").slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    {/* Online dot (UI placeholder) */}
                    <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-extrabold text-zinc-900">
                        {match.username || "Unknown"}
                      </span>
                      {/* Optional time placeholder */}
                      <span className="shrink-0 text-[11px] text-zinc-500"> </span>
                    </div>
                    {/* Optional last message placeholder */}
                    <p className="truncate text-xs text-zinc-600">
                      Tap to open chat
                    </p>
                  </div>

                  <span
                    className={[
                      "ml-1 h-2 w-2 rounded-full",
                      active ? "bg-fuchsia-500" : "bg-zinc-300 group-hover:bg-rose-400",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>

    {/* RIGHT: Chat */}
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        {selectedMatch ? (
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-zinc-200">
              {selectedMatch.imageUrl ? (
                <Image
                  src={`${apiBaseUrl}${selectedMatch.imageUrl}`}
                  alt={selectedMatch.username || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-600">
                  {(selectedMatch.username || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-zinc-900">
                {selectedMatch.username || "User"}
              </p>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-zinc-600">Active</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-extrabold text-zinc-900">Select a match</p>
            <p className="text-xs text-zinc-500">Choose someone from the left to start chatting.</p>
          </div>
        )}

        {/* Optional actions (UI only) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            disabled={!selectedMatch}
          >
            View profile
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-rose-50/30 via-white to-white p-4">
        {messagesLoading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-600">
            No messages yet.
            <div className="mt-1 text-xs text-zinc-500">Send a message to start the conversation ✨</div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => {
              const isMine = message.senderId === myProfile._id;

              return (
                <div key={message._id} className={isMine ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={[
                      "max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                      isMine
                        ? "bg-gradient-to-r from-fuchsia-600 to-rose-600 text-white"
                        : "bg-white text-zinc-900 ring-1 ring-zinc-200",
                    ].join(" ")}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>

                    {/* Optional timestamp slot */}
                    <div className={isMine ? "mt-1 text-right text-[10px] text-white/80" : "mt-1 text-right text-[10px] text-zinc-500"}>
                      {/* {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="border-t border-zinc-200 bg-white p-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              disabled={matches.length === 0}
              placeholder={matches.length === 0 ? "No matches yet" : "Type a message..."}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400
                focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:bg-zinc-50 disabled:text-zinc-500"
            />
          </div>

          <button
            type="button"
            disabled={!selectedMatchId || !messageInput.trim()}
            onClick={() => void sendMessage()}
            className="rounded-2xl bg-gradient-to-r from-rose-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200
              hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  </div>
</div>
            ) : viewMode === "my-profile" ? (
              <form
                onSubmit={submitMyProfileUpdate}
                className="h-full w-full overflow-y-auto rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8"
              >
                {/* Header */}
                <div className="flex flex-col gap-1">
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">My Profile</h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      Update your details and photos so others can know you better.
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-6 h-px w-full bg-zinc-200/70" />

                {/* BASIC INFO */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-zinc-900">Basic information</p>
                    <span className="text-xs text-zinc-500">Public</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* First Name */}
                    <div className="min-w-0">
                      <label className="mb-1.5 block text-sm font-semibold text-zinc-900">First Name</label>
                      <input
                        value={myProfile.firstName || ""}
                        onChange={(e) => onMyProfileFieldChange("firstName", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400
            focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="min-w-0">
                      <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Last Name</label>
                      <input
                        value={myProfile.lastName || ""}
                        onChange={(e) => onMyProfileFieldChange("lastName", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400
            focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
                      />
                    </div>

                    {/* Email */}
                    <div className="min-w-0 sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Email</label>
                      <input
                        type="email"
                        value={myProfile.email || ""}
                        onChange={(e) => onMyProfileFieldChange("email", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400
            focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
                        placeholder="you@example.com"
                      />
                    </div>

                    {/* Username */}
                    <div className="min-w-0">
                      <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Username</label>
                      <input
                        value={myProfile.username || ""}
                        onChange={(e) => onMyProfileFieldChange("username", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400
            focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
                        placeholder="choose a unique username"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="min-w-0">
                      <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Date of Birth</label>
                      <input
                        type="date"
                        value={myProfile.dateOfBirth || ""}
                        onChange={(e) => onMyProfileFieldChange("dateOfBirth", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900
            focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
                      />
                    </div>

                    {/* Gender */}
                    <div className="min-w-0">
                      <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Gender</label>
                      <select
                        value={myProfile.gender || "other"}
                        onChange={(e) => onMyProfileFieldChange("gender", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900
            focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Interests */}
                    <div className="min-w-0">
                      <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Interests</label>
                      <input
                        value={myInterestsInput}
                        onChange={(e) => setMyInterestsInput(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400
            focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
                        placeholder="coffee, gym, anime"
                      />
                      <p className="mt-1 text-xs text-zinc-500">Separate with commas</p>
                    </div>
                  </div>
                </div>

                {/* ABOUT */}
                <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-zinc-900">About you</p>
                    <span className="text-xs text-zinc-500">Public</span>
                  </div>

                  <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Bio</label>
                  <textarea
                    rows={4}
                    value={myProfile.bio || ""}
                    onChange={(e) => onMyProfileFieldChange("bio", e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400
        focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
                    placeholder="Tell people something real about you (keep it positive ✨)"
                  />
                  <p className="mt-2 text-xs text-zinc-500">Tip: Specific beats generic.</p>
                </div>

                {/* PHOTOS */}
                <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-zinc-900">Photos</p>
                    <span className="text-xs text-zinc-500">Public</span>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Profile Picture */}
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      <label className="mb-2 block text-sm font-semibold text-zinc-900">Profile picture</label>

                      <div className="flex items-center gap-4">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 ring-2 ring-rose-200">
                          {myProfileImage ? (
                            <Image src={myProfileImage} alt="My profile" fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                              No image
                            </div>
                          )}
                        </div>

                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          onChange={(e) => onMyImageChange(e.target.files?.[0])}
                          className="block w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900
              file:mr-3 file:rounded-lg file:border-0 file:bg-rose-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-rose-700"
                        />
                      </div>

                      <p className="mt-2 text-xs text-zinc-500">Best: clear face, good lighting.</p>
                    </div>

                    {/* Gallery Upload */}
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      <label className="mb-2 block text-sm font-semibold text-zinc-900">Gallery images</label>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(e) => void addMyGalleryImages(e.target.files)}
                        className="block w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900
            file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-800"
                      />
                      <p className="mt-2 text-xs text-zinc-500">Add up to 6 photos. Mix lifestyle + hobbies.</p>
                    </div>
                  </div>

                  {/* Gallery grid */}
                  <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {myExistingGallery.map((img, idx) => (
                      <div
                        key={`my-existing-${img}-${idx}`}
                        className="group relative h-20 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200"
                      >
                        <Image src={`${apiBaseUrl}${img}`} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeMyExistingGalleryImage(idx)}
                          className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                        >
                          X
                        </button>
                      </div>
                    ))}

                    {mySelectedGallery.map((item, idx) => (
                      <div
                        key={`my-selected-${item.preview}-${idx}`}
                        className="group relative h-20 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200"
                      >
                        <img src={item.preview} alt={`Selected ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeMySelectedGalleryImage(idx)}
                          className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message */}
                {profileMessage && (
                  <p className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700">
                    {profileMessage}
                  </p>
                )}

                {/* Bottom save (kept, nicer) */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-zinc-500">
                    Your profile updates may take a moment to reflect.
                  </p>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {profileSaving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-3xl border border-zinc-200 bg-white p-3">
                <div className="relative h-[calc(100vh-260px)] min-h-[420px] max-h-[740px] w-full">
                  {next ? (
                    <div className="absolute inset-0 scale-[0.985]">
                      <div className="h-full w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100">
                        {(next.profileImages?.[0] || next.imageUrl) ? (
                          <Image
                            src={`${apiBaseUrl}${next.profileImages?.[0] || next.imageUrl!}`}
                            alt={`${next.username || "User"} profile image`}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />
                      </div>
                    </div>
                  ) : null}

                  {current ? (
                    <div className="absolute inset-0">
                      <div
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        className="h-full w-full touch-none select-none"
                        style={{ transform, transition }}
                      >
                        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-[0_30px_90px_-55px_rgba(0,0,0,0.55)]">
                          <div className="absolute left-6 right-6 top-4 z-20 flex gap-2">
                            {imageGallery.length > 0 ? (
                              imageGallery.map((_, barIdx) => (
                                <div
                                  key={`story-bar-${barIdx}`}
                                  className={`h-1.5 flex-1 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 ${barIdx === galleryIndex ? "opacity-100" : "opacity-30"}`}
                                />
                              ))
                            ) : (
                              <div className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 opacity-30" />
                            )}
                          </div>

                          {coverImage ? (
                            <Image
                              src={`${apiBaseUrl}${coverImage}`}
                              alt={`${current.username || "User"} profile image`}
                              fill
                              className="object-cover"
                              priority
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-sm font-semibold text-zinc-700">No image</div>
                          )}

                          <div className="pointer-events-none absolute left-6 top-16 z-20">
                            <div
                              style={{ opacity: likeOpacity }}
                              className="inline-flex rotate-[-10deg] rounded-xl border-4 border-emerald-400 px-4 py-2 text-3xl font-extrabold text-emerald-400"
                            >
                              LIKE
                            </div>
                          </div>
                          <div className="pointer-events-none absolute right-6 top-16 z-20">
                            <div
                              style={{ opacity: nopeOpacity }}
                              className="inline-flex rotate-[12deg] rounded-xl border-4 border-rose-500 px-4 py-2 text-3xl font-extrabold text-rose-500"
                            >
                              NOPE
                            </div>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />

                          <div className="absolute bottom-6 left-6 z-20">
                            <p className="text-lg font-extrabold text-white">{currentAge ? `${currentAge},` : ""}</p>
                            <p className="text-lg font-extrabold text-white">{current.username || "Unknown"}</p>
                          </div>

                          <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center">
                            <div className="flex w-full max-w-[520px] items-center justify-between px-10">
                              <button
                                type="button"
                                onPointerDown={(e) => e.stopPropagation()}
                                onPointerUp={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dislike();
                                }}
                                disabled={!!fly}
                                className="grid h-12 w-12 place-items-center rounded-full bg-white shadow hover:bg-zinc-50 disabled:opacity-50"
                                aria-label="Dislike"
                                title="Dislike"
                              >
                                <span className="text-rose-600 text-xl font-extrabold">×</span>
                              </button>

                              <div />

                              <button
                                type="button"
                                onPointerDown={(e) => e.stopPropagation()}
                                onPointerUp={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  like();
                                }}
                                disabled={!!fly}
                                className="grid h-12 w-12 place-items-center rounded-full bg-white shadow hover:bg-zinc-50 disabled:opacity-50"
                                aria-label="Like"
                                title="Like"
                              >
                                <span className="text-fuchsia-600 text-lg">♥</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid h-full place-items-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50">
                      <div className="text-center">
                        <p className="text-lg font-extrabold text-zinc-900">No more profiles</p>
                        <p className="mt-2 text-sm text-zinc-700">Come back later.</p>
                      </div>
                    </div>
                  )}
                </div>

                {current ? (
                  <div className="mt-4 w-full rounded-2xl border border-zinc-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-extrabold text-zinc-900">{current.username || "Unknown"}</p>
                      <p className="text-sm font-semibold text-zinc-700">
                        {currentAge ? `${currentAge} yrs` : ""}
                        {current.gender ? ` • ${current.gender}` : ""}
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-zinc-700">{current.bio || "No bio yet."}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(current.interests || []).slice(0, 6).map((interest, idx) => (
                        <span
                          key={`${interest}-${idx}`}
                          className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
