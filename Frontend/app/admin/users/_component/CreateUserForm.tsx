"use client";

import { Controller, useForm } from "react-hook-form";
import { UserData, UserSchema } from "@/app/admin/users/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { handleCreateUser } from "@/lib/actions/admin/user-action";

const inputClassName =
  "h-11 w-full rounded-xl border border-zinc-300/90 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-800 focus:ring-2 focus:ring-cyan-100";

const textAreaClassName =
  "w-full rounded-xl border border-zinc-300/90 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-800 focus:ring-2 focus:ring-cyan-100";

const sectionClassName = "rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/70 p-5 shadow-sm";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message;
  return "Create profile failed";
};

export default function CreateUserForm() {
  const [pending, startTransition] = useTransition();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserData>({
    resolver: zodResolver(UserSchema),
  });

  const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
    onChange(file);
  };

  const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
    setPreviewImage(null);
    onChange?.(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: UserData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();

        if (data.firstName) formData.append("firstName", data.firstName);
        if (data.lastName) formData.append("lastName", data.lastName);

        formData.append("email", data.email);
        formData.append("username", data.username);
        formData.append("password", data.password);
        formData.append("confirmPassword", data.confirmPassword);

        if (data.dateOfBirth) formData.append("dateOfBirth", data.dateOfBirth);
        if (data.gender) formData.append("gender", data.gender);
        if (data.interests !== undefined) formData.append("interests", data.interests);
        if (data.bio !== undefined) formData.append("bio", data.bio);
        if (data.image) formData.append("image", data.image);

        const response = await handleCreateUser(formData);
        if (!response.success) throw new Error(response.message || "Create profile failed");

        reset();
        handleDismissImage();
        toast.success("Profile created successfully");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className={sectionClassName}>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">Profile Image</h2>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
          {previewImage ? (
            <div className="relative">
              <img src={previewImage} alt="Profile preview" className="h-24 w-24 rounded-full border border-zinc-200 object-cover shadow-sm" />
              <Controller
                name="image"
                control={control}
                render={({ field: { onChange } }) => (
                  <button
                    type="button"
                    onClick={() => handleDismissImage(onChange)}
                  className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white shadow hover:bg-rose-600"
                  >
                    x
                  </button>
                )}
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-zinc-300 bg-white text-xs font-medium text-zinc-500 shadow-sm">
              No image
            </div>
          )}

          <div className="w-full">
            <Controller
              name="image"
              control={control}
              render={({ field: { onChange } }) => (
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                  accept=".jpg,.jpeg,.png,.webp"
                  className="block w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm"
                />
              )}
            />
            <p className="mt-1 text-xs text-zinc-500">JPG, PNG, or WEBP up to 5MB.</p>
            {errors.image && <p className="mt-1 text-xs text-rose-600">{errors.image.message}</p>}
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">Basic Info</h2>
        <p className="mt-1 text-xs text-zinc-500">Core identity and account fields.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="firstName">First name</label>
            <input id="firstName" type="text" autoComplete="given-name" className={inputClassName} {...register("firstName")} placeholder="Jane" />
            {errors.firstName?.message && <p className="text-xs text-rose-600">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="lastName">Last name</label>
            <input id="lastName" type="text" autoComplete="family-name" className={inputClassName} {...register("lastName")} placeholder="Doe" />
            {errors.lastName?.message && <p className="text-xs text-rose-600">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" className={inputClassName} {...register("email")} placeholder="you@example.com" />
            {errors.email?.message && <p className="text-xs text-rose-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="username">Username</label>
            <input id="username" type="text" autoComplete="username" className={inputClassName} {...register("username")} placeholder="janedoe" />
            {errors.username?.message && <p className="text-xs text-rose-600">{errors.username.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="dateOfBirth">Date of birth</label>
            <input id="dateOfBirth" type="date" className={inputClassName} {...register("dateOfBirth")} />
            {errors.dateOfBirth?.message && <p className="text-xs text-rose-600">{errors.dateOfBirth.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="gender">Gender</label>
            <select id="gender" className={inputClassName} {...register("gender")} defaultValue="">
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender?.message && <p className="text-xs text-rose-600">{errors.gender.message}</p>}
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">Profile Details</h2>
        <p className="mt-1 text-xs text-zinc-500">Set profile metadata shown in the app.</p>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="interests">Interests</label>
          <input id="interests" type="text" className={inputClassName} {...register("interests")} placeholder="music, travel, reading" />
          <p className="text-xs text-zinc-500">Comma separated values.</p>
          {errors.interests?.message && <p className="text-xs text-rose-600">{errors.interests.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="bio">Bio</label>
          <textarea id="bio" rows={4} className={textAreaClassName} {...register("bio")} placeholder="Short bio..." />
          {errors.bio?.message && <p className="text-xs text-rose-600">{errors.bio.message}</p>}
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-700">Security</h2>
        <p className="mt-1 text-xs text-zinc-500">Password fields are required for account creation.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password" className={inputClassName} {...register("password")} placeholder="******" />
            {errors.password?.message && <p className="text-xs text-rose-600">{errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" autoComplete="new-password" className={inputClassName} {...register("confirmPassword")} placeholder="******" />
            {errors.confirmPassword?.message && <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p>}
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            reset();
            handleDismissImage();
          }}
          className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          Clear form
        </button>
        <button
          type="submit"
          disabled={isSubmitting || pending}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {isSubmitting || pending ? "Creating account..." : "Create account"}
        </button>
      </div>
    </form>
  );
}
