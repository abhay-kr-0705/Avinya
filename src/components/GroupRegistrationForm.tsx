import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

interface TeamMember {
  name: string;
  email: string;
  registration_no: string;
  mobile_no: string;
  semester: string;
}

interface GroupRegistrationFormProps {
  eventId: string;
  maxTeamSize: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const GroupRegistrationForm: React.FC<GroupRegistrationFormProps> = ({
  eventId,
  maxTeamSize,
  onSuccess,
  onCancel
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamName, setTeamName] = useState('');

  const addTeamMember = () => {
    if (teamMembers.length < maxTeamSize) {
      setTeamMembers([...teamMembers, {
        name: '',
        email: '',
        registration_no: '',
        mobile_no: '',
        semester: ''
      }]);
    }
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setTeamMembers(updatedMembers);
  };

  const onSubmit = async (data: any) => {
    try {
      // Validate team members
      if (teamMembers.length < 2) {
        toast.error('At least 2 team members are required');
        return;
      }

      // Validate team name
      if (!teamName.trim()) {
        toast.error('Please enter a team name');
        return;
      }

      // Prepare registration data
      const registrationData = {
        eventId,
        teamName,
        teamMembers,
        leader: {
          name: data.name,
          email: data.email,
          registration_no: data.registration_no,
          mobile_no: data.mobile_no,
          semester: data.semester
        }
      };

      // Send registration data to backend
      const response = await fetch('/api/events/register/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      toast.success('Registration successful!');
      onSuccess();
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Team Name</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Team Leader Details</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              {...register('name', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.name && <span className="text-red-500">Name is required</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.email && <span className="text-red-500">Valid email is required</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Registration Number</label>
            <input
              type="text"
              {...register('registration_no', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.registration_no && <span className="text-red-500">Registration number is required</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="tel"
              {...register('mobile_no', { required: true, pattern: /^[0-9]{10}$/ })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.mobile_no && <span className="text-red-500">Valid 10-digit mobile number is required</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <input
              type="text"
              {...register('semester', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.semester && <span className="text-red-500">Semester is required</span>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
        <div className="mt-4 space-y-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium">Team Member {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeTeamMember(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                  <input
                    type="text"
                    value={member.registration_no}
                    onChange={(e) => updateTeamMember(index, 'registration_no', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <input
                    type="tel"
                    value={member.mobile_no}
                    onChange={(e) => updateTeamMember(index, 'mobile_no', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <input
                    type="text"
                    value={member.semester}
                    onChange={(e) => updateTeamMember(index, 'semester', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {teamMembers.length < maxTeamSize && (
          <button
            type="button"
            onClick={addTeamMember}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Team Member
          </button>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Register Team
        </button>
      </div>
    </form>
  );
};

export default GroupRegistrationForm; 