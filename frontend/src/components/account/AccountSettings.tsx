import { useState, useEffect } from "react";
import {
    TextInput,
    Button,
    Checkbox,
    FileInput,
    Avatar,
    Group,
    Stack,
    Title,
    Loader,
    Text,
    Select,
    Container,
    Center,
} from "@mantine/core";
import { Account, AccountValidationErrors } from "../../types";
import { useAccount } from "../../contexts/useAccount";
import AppShell from "../appShell/AppShell";
import { updateAccount } from "../../api/authService";
import { isEqual } from "lodash";
import { notifications } from "@mantine/notifications";
import citiesAndStates from "../../utils/citiesAndStates";
import { DatePicker } from "@mantine/dates";
import { dateToString, stringToDate } from "../../utils/dateConversion";

export default function AccountSettings() {
    const { currentAccount, setCurrentAccount } = useAccount();

    if (!currentAccount) {
        return <Loader />;
    }

    console.log(currentAccount);

    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<Account>(currentAccount);
    const [picture, setPicture] = useState<File | undefined>();
    const [errors, setErrors] = useState<AccountValidationErrors | undefined>();
    const wasChanged = !isEqual(currentAccount, form) || picture;

    const handleSave = async () => {
        setSaving(true);
        setErrors(undefined); // Clear previous errors

        const formData = new FormData();
        if (picture) {
            formData.append("profile_picture", picture);
        }
        Object.entries(form).forEach(([key, value]) => {
            formData.append(`${key}`, String(value));
        });

        console.log(formData);
        updateAccount(form.id, formData)
            .then((data) => {
                setForm(data);
                setCurrentAccount(data);
                setPicture(undefined);
                notifications.show({
                    color: "green",
                    message: "Profile updated.",
                    position: "top-center",
                    autoClose: 1500,
                });
            })
            .catch((error) => {
                notifications.show({
                    color: "red",
                    message: "Please fix errors and try again.",
                    position: "top-center",
                    autoClose: 1500,
                });
                setErrors(error.response.data);
            })
            .finally(() => {
                setSaving(false);
            });
    };

    const discardChanges = () => {
        setForm(currentAccount);
        setPicture(undefined);
        setErrors({});
    };

    return (
        <AppShell>
            <Stack w="50%">
                <Title tt="uppercase" order={2} mb="lg">
                    Profile Settings
                </Title>
                {wasChanged && (
                    <Stack mb="lg">
                        <Button onClick={handleSave} loading={saving} fullWidth>
                            Save Changes
                        </Button>
                        <Button
                            onClick={() => {
                                discardChanges();
                            }}
                            fullWidth
                        >
                            Discard changes
                        </Button>
                    </Stack>
                )}
                <Group justify="center">
                    <Avatar
                        src={
                            picture
                                ? URL.createObjectURL(picture)
                                : form.profile_picture
                        }
                        radius="150"
                        size="300px"
                    />
                    <FileInput
                        label="Change Profile Picture"
                        placeholder="Choose file"
                        onChange={(file) => file && setPicture(file)}
                        accept="image/*"
                    />
                </Group>

                <TextInput
                    label="Username"
                    value={form.username ?? ""}
                    onChange={(e) => {
                        setForm({
                            ...form,
                            username: e.currentTarget.value,
                        });
                        setErrors({ ...errors, username: undefined });
                    }}
                    error={wasChanged && errors?.username} // Display the first error for 'username'
                />

                <TextInput
                    label="First Name"
                    value={form.first_name}
                    onChange={(e) => {
                        setForm({
                            ...form,
                            first_name: e.currentTarget.value,
                        });
                        setErrors({ ...errors, first_name: undefined });
                    }}
                    error={wasChanged && errors?.first_name} // Display the first error for 'first_name'
                />

                <TextInput
                    label="Last Name"
                    value={form.last_name}
                    onChange={(e) => {
                        setForm({
                            ...form,
                            last_name: e.currentTarget.value,
                        });
                        setErrors({ ...errors, last_name: undefined });
                    }}
                    error={wasChanged && errors?.last_name} // Display the first error for 'last_name'
                />

                <TextInput label="Email" value={form.email} disabled />

                <Select
                    label="Here for the:"
                    value={form.here_for_the}
                    onChange={(value) =>
                        setForm({
                            ...form,
                            here_for_the: value ?? "Competition",
                        })
                    }
                    data={[
                        { value: "Competition", label: "Competition" },
                        { value: "Cash Prizes", label: "Cash Prizes" },
                        { value: "Learning", label: "Learning" },
                        {
                            value: "Strategy Testing",
                            label: "Strategy Testing",
                        },
                        {
                            value: "Just Checking It Out",
                            label: "Just Checking It Out",
                        },
                    ]}
                    error={errors?.here_for_the}
                />
                <Select
                    label="Education"
                    value={form.education}
                    onChange={(value) =>
                        setForm({ ...form, education: value ?? "None" })
                    }
                    data={[
                        { value: "None", label: "None" },
                        { value: "High School", label: "High School" },
                        { value: "College", label: "College" },
                        { value: "Post-Grad", label: "Post-Grad" },
                    ]}
                    error={errors?.education}
                />
                <Select
                    label="Gender"
                    value={form.gender}
                    onChange={(value) =>
                        setForm({ ...form, gender: value ?? "Male" })
                    }
                    data={[
                        { value: "Male", label: "Male" },
                        { value: "Female", label: "Female" },
                        { value: "Other", label: "Other" },
                        {
                            value: "Prefer not to say",
                            label: "Prefer not to say",
                        },
                    ]}
                    error={errors?.gender}
                />

                <Select
                    label="Location"
                    placeholder="Enter your location"
                    data={citiesAndStates}
                    value={form.location ?? ""}
                    onChange={(value) =>
                        setForm({ ...form, location: value ?? "" })
                    }
                    error={errors?.location}
                    searchable
                />

                <Stack align="center">
                    <Text size="sm">Choose Birthday</Text>
                    {errors?.birthday && <Text c="red">{errors.birthday}</Text>}
                    <DatePicker
                        date={stringToDate(form.birthday)}
                        onDateChange={(date) => {
                            const formattedDate = dateToString(date!);
                            setForm({
                                ...form,
                                birthday: formattedDate,
                            });
                        }}
                        value={stringToDate(form.birthday)}
                        onChange={(date) => {
                            const formattedDate = dateToString(date!);
                            setForm({
                                ...form,
                                birthday: formattedDate,
                            });
                        }}
                        maxDate={new Date()}
                        weekendDays={[]}
                    />
                </Stack>

                <Title mt="20px" tt="uppercase" order={2} mb="lg">
                    Notification Settings
                </Title>

                <Stack align="center">
                    <Stack>
                        <Checkbox
                            mb="md"
                            label="Toggle all notifications"
                            checked={form.weekly_summary}
                            onChange={(e) => {
                                setForm({
                                    ...form,
                                    weekly_summary: e.currentTarget.checked,
                                    daily_summary: e.currentTarget.checked,
                                    contest_rank_change:
                                        e.currentTarget.checked,
                                });
                                setErrors({
                                    ...errors,
                                    weekly_summary: undefined,
                                    daily_summary: undefined,
                                    contest_rank_change: undefined,
                                });
                            }}
                            error={errors?.weekly_summary}
                        />

                        <Checkbox
                            label="Weekly Summary"
                            checked={form.weekly_summary}
                            onChange={(e) => {
                                setForm({
                                    ...form,
                                    weekly_summary: e.currentTarget.checked,
                                });
                                setErrors({
                                    ...errors,
                                    weekly_summary: undefined,
                                });
                            }}
                            error={errors?.weekly_summary}
                        />

                        <Checkbox
                            label="Daily Summary"
                            checked={form.daily_summary}
                            onChange={(e) => {
                                setForm({
                                    ...form,
                                    daily_summary: e.currentTarget.checked,
                                });
                                setErrors({
                                    ...errors,
                                    daily_summary: undefined,
                                });
                            }}
                            error={errors?.daily_summary}
                        />

                        <Checkbox
                            label="Contest Rank Change"
                            checked={form.contest_rank_change}
                            onChange={(e) => {
                                setForm({
                                    ...form,
                                    contest_rank_change:
                                        e.currentTarget.checked,
                                });
                                setErrors({
                                    ...errors,
                                    contest_rank_change: undefined,
                                });
                            }}
                            error={errors?.contest_rank_change} // Error for contest rank change
                        />
                    </Stack>
                </Stack>

                {wasChanged && (
                    <Stack mt="lg">
                        <Button onClick={handleSave} loading={saving} fullWidth>
                            Save Changes
                        </Button>
                        <Button
                            onClick={() => {
                                discardChanges();
                            }}
                            fullWidth
                        >
                            Discard changes
                        </Button>
                    </Stack>
                )}
            </Stack>
        </AppShell>
    );
}
