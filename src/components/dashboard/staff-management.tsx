"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Image as ImageIcon,
  X,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createStaff,
  updateStaff,
  updateStaffSchedule,
  addTimeOff,
  deleteTimeOff,
} from "@/app/actions/staff";
import { format } from "date-fns";

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface TimeOff {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  reason: string | null;
}

interface StaffMember {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  imageUrl: string | null;
  isActive: boolean;
  schedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  timeOffs: TimeOff[];
}

interface StaffManagementProps {
  initialStaff: StaffMember[];
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export function StaffManagement({ initialStaff }: StaffManagementProps) {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [timeOffModalOpen, setTimeOffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    imageUrl: "",
    isActive: true,
  });

  const [schedules, setSchedules] = useState<Array<Schedule & { isWorking: boolean }>>(
    DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.value,
      startTime: "09:00",
      endTime: "18:00",
      isWorking: false,
    }))
  );

  const [timeOffData, setTimeOffData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleOpenEditModal = (staffMember?: StaffMember) => {
    if (staffMember) {
      setSelectedStaff(staffMember);
      setFormData({
        name: staffMember.name,
        email: staffMember.email || "",
        phone: staffMember.phone || "",
        imageUrl: staffMember.imageUrl || "",
        isActive: staffMember.isActive,
      });
    } else {
      setSelectedStaff(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        imageUrl: "",
        isActive: true,
      });
    }
    setError(null);
    setEditModalOpen(true);
  };

  const handleOpenScheduleModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    // Pre-fill schedules from existing data
    const existingSchedules = DAYS_OF_WEEK.map((day) => {
      const existing = staffMember.schedules.find((s) => s.dayOfWeek === day.value);
      return {
        dayOfWeek: day.value,
        startTime: existing?.startTime || "09:00",
        endTime: existing?.endTime || "18:00",
        isWorking: !!existing,
      };
    });
    setSchedules(existingSchedules);
    setError(null);
    setScheduleModalOpen(true);
  };

  const handleOpenTimeOffModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setTimeOffData({
      startDate: "",
      endDate: "",
      reason: "",
    });
    setError(null);
    setTimeOffModalOpen(true);
  };

  const handleSaveStaff = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = selectedStaff
        ? await updateStaff(selectedStaff.id, {
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            imageUrl: formData.imageUrl || null,
            isActive: formData.isActive,
          })
        : await createStaff({
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            imageUrl: formData.imageUrl || null,
            isActive: formData.isActive,
          });

      if (result.success) {
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        setError(result.error || "Failed to save staff member");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedStaff) return;

    setLoading(true);
    setError(null);

    try {
      const activeSchedules = schedules
        .filter((s) => s.isWorking)
        .map(({ isWorking, ...schedule }) => schedule);

      const result = await updateStaffSchedule(selectedStaff.id, activeSchedules);

      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error || "Failed to save schedule");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeOff = async () => {
    if (!selectedStaff) return;

    setLoading(true);
    setError(null);

    try {
      const result = await addTimeOff(selectedStaff.id, {
        startDate: timeOffData.startDate,
        endDate: timeOffData.endDate,
        reason: timeOffData.reason || null,
      });

      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error || "Failed to add time off");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeOff = async (timeOffId: string) => {
    if (!confirm("Are you sure you want to delete this time off?")) return;

    setLoading(true);
    try {
      const result = await deleteTimeOff(timeOffId);
      if (result.success) {
        window.location.reload();
      }
    } catch (err) {
      setError("Failed to delete time off");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Staff Button */}
      <div className="flex justify-end">
        <Button onClick={() => handleOpenEditModal()} size="md">
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((staffMember) => (
          <div
            key={staffMember.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {staffMember.imageUrl ? (
                    <img
                      src={staffMember.imageUrl}
                      alt={staffMember.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{staffMember.name}</h3>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      staffMember.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    )}
                  >
                    {staffMember.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              {staffMember.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{staffMember.email}</span>
                </div>
              )}
              {staffMember.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{staffMember.phone}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEditModal(staffMember)}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenScheduleModal(staffMember)}
              >
                <Clock className="w-3 h-3 mr-1" />
                Schedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenTimeOffModal(staffMember)}
              >
                <Calendar className="w-3 h-3 mr-1" />
                Time Off
              </Button>
            </div>

            {/* Time Off List */}
            {staffMember.timeOffs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Time Off:</p>
                <div className="space-y-1">
                  {staffMember.timeOffs.slice(0, 3).map((timeOff) => {
                    const startDate =
                      timeOff.startDate instanceof Date
                        ? timeOff.startDate
                        : new Date(timeOff.startDate);
                    const endDate =
                      timeOff.endDate instanceof Date ? timeOff.endDate : new Date(timeOff.endDate);
                    return (
                      <div
                        key={timeOff.id}
                        className="flex items-center justify-between text-xs text-gray-600"
                      >
                        <span>
                          {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                        </span>
                        <button
                          onClick={() => handleDeleteTimeOff(timeOff.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  {staffMember.timeOffs.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{staffMember.timeOffs.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No staff members yet</p>
          <Button onClick={() => handleOpenEditModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Staff Member
          </Button>
        </div>
      )}

      {/* Edit/Add Staff Modal */}
      <Dialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title={selectedStaff ? "Edit Staff Member" : "Add Staff Member"}
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Staff member name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="staff@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+374XXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Avatar URL
            </label>
            <Input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              label="Active"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStaff} disabled={loading || !formData.name}>
              {loading ? "Saving..." : selectedStaff ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        title={`Manage Schedule - ${selectedStaff?.name}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} disabled={loading}>
              {loading ? "Saving..." : "Save Schedule"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Header Row */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center pb-2 border-b border-gray-200 text-xs font-medium text-gray-600">
            <div>Day</div>
            <div className="text-center">Start</div>
            <div className="text-center">End</div>
          </div>

          {/* Scrollable Days List */}
          <div className="max-h-[60vh] overflow-y-auto space-y-2 -mr-2 pr-2">
            {DAYS_OF_WEEK.map((day) => {
              const schedule = schedules.find((s) => s.dayOfWeek === day.value);
              if (!schedule) return null;

              // Short day name (Mon, Tue, etc.)
              const shortDayName = day.label.substring(0, 3);

              return (
                <div
                  key={day.value}
                  className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                >
                  {/* Left: Switch + Day Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Switch
                      checked={schedule.isWorking}
                      onCheckedChange={(checked) => {
                        setSchedules(
                          schedules.map((s) =>
                            s.dayOfWeek === day.value ? { ...s, isWorking: checked } : s
                          )
                        );
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900 w-12">
                      {shortDayName}
                    </span>
                  </div>

                  {/* Right: Time Inputs (only if working) */}
                  {schedule.isWorking ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => {
                          setSchedules(
                            schedules.map((s) =>
                              s.dayOfWeek === day.value
                                ? { ...s, startTime: e.target.value }
                                : s
                            )
                          );
                        }}
                        className="h-8 w-24 text-sm px-2 py-1"
                      />
                      <span className="text-gray-400 text-sm">→</span>
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => {
                          setSchedules(
                            schedules.map((s) =>
                              s.dayOfWeek === day.value
                                ? { ...s, endTime: e.target.value }
                                : s
                            )
                          );
                        }}
                        className="h-8 w-24 text-sm px-2 py-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-[208px]">
                      <div className="h-8 w-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">—</span>
                      </div>
                      <span className="text-gray-400 text-sm">→</span>
                      <div className="h-8 w-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">—</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Dialog>

      {/* Time Off Modal */}
      <Dialog
        open={timeOffModalOpen}
        onOpenChange={setTimeOffModalOpen}
        title={`Add Time Off - ${selectedStaff?.name}`}
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
            <Input
              type="date"
              value={timeOffData.startDate}
              onChange={(e) => setTimeOffData({ ...timeOffData, startDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
            <Input
              type="date"
              value={timeOffData.endDate}
              onChange={(e) => setTimeOffData({ ...timeOffData, endDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
            <Input
              value={timeOffData.reason}
              onChange={(e) => setTimeOffData({ ...timeOffData, reason: e.target.value })}
              placeholder="Vacation, sick leave, etc."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setTimeOffModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTimeOff}
              disabled={loading || !timeOffData.startDate || !timeOffData.endDate}
            >
              {loading ? "Adding..." : "Add Time Off"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
