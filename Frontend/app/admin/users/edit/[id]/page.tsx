"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

type UserFormData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  image?: File;
};

type UserResponse = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  imageUrl?: string;
};

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id;
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } =
    useForm<UserFormData>();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const json = await res.json();
        if (!res.ok || json.success === false) {
          throw new Error(json.message || "Failed to load user");
        }
        const user: UserResponse = json.data;
        reset({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          username: user.username || "",
        });
        setExistingImage(user.imageUrl ? `${baseUrl}${user.imageUrl}` : null);
      } catch (err: any) {
        toast.error(err.message || "Error loading user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, reset, baseUrl]);

  const handleImageChange = (file: File | undefined, onChange: (file?: File) => void) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
    onChange(file);
  };

  const handleDismissImage = (onChange: (file?: File) => void) => {
    setPreviewImage(null);
    onChange(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: UserFormData) => {
    if (!userId) return;
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (data.firstName) formData.append("firstName", data.firstName);
        if (data.lastName) formData.append("lastName", data.lastName);
        if (data.email) formData.append("email", data.email);
        if (data.username) formData.append("username", data.username);
        if (data.image) formData.append("image", data.image);

        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "PUT",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || json.success === false) {
          throw new Error(json.message || "Failed to update user");
        }
        toast.success("User updated");
        router.push("/admin/users");
      } catch (err: any) {
        toast.error(err.message || "Error updating user");
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-zinc-500">Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-zinc-900">Edit User</h1>
        <p className="text-base text-zinc-700 mt-1">Update profile details for this account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : existingImage ? (
            <img
              src={existingImage}
              alt="Current"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-zinc-100" />
          )}
          <div className="space-y-2">
            <Controller
              name="image"
              control={control}
              render={({ field: { onChange } }) => (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                  className="text-sm text-zinc-800"
                />
              )}
            />
            {previewImage && (
              <Controller
                name="image"
                control={control}
                render={({ field: { onChange } }) => (
                  <button
                    type="button"
                    onClick={() => handleDismissImage(onChange)}
                    className="text-sm font-medium text-rose-600 hover:underline"
                  >
                    Remove selected image
                  </button>
                )}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-800" htmlFor="firstName">First name</label>
            <input
              id="firstName"
              type="text"
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-700"
              {...register("firstName")}
            />
            {errors.firstName?.message && (
              <p className="text-xs text-rose-600">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-800" htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              type="text"
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-700"
              {...register("lastName")}
            />
            {errors.lastName?.message && (
              <p className="text-xs text-rose-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-zinc-800" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-700"
            {...register("email")}
          />
          {errors.email?.message && (
            <p className="text-xs text-rose-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-zinc-800" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-700"
            {...register("username")}
          />
          {errors.username?.message && (
            <p className="text-xs text-rose-600">{errors.username.message}</p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || pending}
            className="inline-flex items-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-zinc-800 disabled:opacity-60"
          >
            {isSubmitting || pending ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="inline-flex items-center rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
