"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { handleUpdateProfile } from "@/lib/actions/auth-action";

import { UpdateUserData, updateUserSchema } from "../schema";

export default function UpdateUserForm({ user }: { user: any }) {
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } =
        useForm<UpdateUserData>({
            resolver: zodResolver(updateUserSchema),
            values: {
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || '',
                username: user?.username || ''
            }
        });

    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onSubmit = async (data: UpdateUserData) => {
        setError(null);
        try {
            const formData = new FormData();
            formData.append('firstName', data.firstName);
            formData.append('lastName', data.lastName);
            formData.append('email', data.email);
            formData.append('username', data.username);
            if (data.image) formData.append('image', data.image);

            const response = await handleUpdateProfile(formData);
            if (!response.success) throw new Error(response.message || 'Update profile failed');

            handleDismissImage();
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Profile update failed');
            setError(error.message || 'Profile update failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl shadow-2xl border border-pink-200">
            <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">Edit Profile</h1>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {error && <p className="text-center text-sm text-red-600">{error}</p>}

                {/* Profile Image */}
                <div className="flex flex-col items-center space-y-3">
                    <div className="relative w-28 h-28">
                        {previewImage ? (
                            <>
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-28 h-28 rounded-full object-cover border-4 border-pink-200 shadow-lg"
                                />
                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                        <button
                                            type="button"
                                            onClick={() => handleDismissImage(onChange)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md hover:bg-red-600 transition"
                                        >
                                            ✕
                                        </button>
                                    )}
                                />
                            </>
                        ) : user?.imageUrl ? (
                            <Image
                                src={process.env.NEXT_PUBLIC_API_BASE_URL + user.imageUrl}
                                alt="Profile"
                                width={112}
                                height={112}
                                className="w-28 h-28 rounded-full object-cover border-4 border-pink-200 shadow-lg"
                            />
                        ) : (
                            <div className="w-28 h-28 bg-pink-100 rounded-full flex items-center justify-center border-4 border-pink-200 shadow-lg">
                                <span className="text-pink-400 font-semibold">Add Photo</span>
                            </div>
                        )}
                    </div>

                    <Controller
                        name="image"
                        control={control}
                        render={({ field: { onChange } }) => (
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                                accept=".jpg,.jpeg,.png,.webp"
                                className="text-sm text-gray-600"
                            />
                        )}
                    />
                    {errors.image && <p className="text-sm text-red-600">{errors.image.message}</p>}
                </div>

                {/* Floating Label Inputs */}
                {[
                    { label: 'Username', id: 'username', type: 'text' },
                    { label: 'Email', id: 'email', type: 'email' },
                    { label: 'First Name', id: 'firstName', type: 'text' },
                    { label: 'Last Name', id: 'lastName', type: 'text' }
                ].map(field => (
                    <div key={field.id} className="relative">
                        <input
                            id={field.id}
                            type={field.type}
                            {...register(field.id as keyof UpdateUserData)}
                            placeholder=" "
                            className="w-full border border-pink-200 rounded-2xl px-3 pt-5 pb-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition placeholder-transparent"
                        />
                        <label
                            htmlFor={field.id}
                            className="absolute left-3 top-2 text-gray-400 text-sm transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-pink-600 peer-focus:text-sm"
                        >
                            {field.label}
                        </label>
                        {errors[field.id as keyof UpdateUserData] && (
                            <p className="text-sm text-red-600 mt-1">{errors[field.id as keyof UpdateUserData]?.message}</p>
                        )}
                    </div>
                ))}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl hover:scale-105 transform transition disabled:opacity-50"
                >
                    {isSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
