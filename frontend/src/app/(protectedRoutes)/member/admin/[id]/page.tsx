'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

interface Manager {
  _id: string;
  name: string;
}

const UpdateMember = () => {
  const { id } = useParams();
  const router = useRouter();
  const toast = useRef<Toast>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [managerId, setManagerId] = useState('');
  const [password, setPassword] = useState('');
  const [managers, setManagers] = useState<Manager[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Fetch user by ID
        const userRes = await axios.get(`http://localhost:5000/api/users/${id}`, {
          withCredentials: true,
        });
        const user = userRes.data.data;
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setManagerId(user.manager || '');

        // ✅ Fetch all managers
        const managersRes = await axios.post(`http://localhost:5000/api/users/manager`, {}, {
          withCredentials: true,
        });
        const filtered = managersRes.data.data.filter((m: any) => m.role === 'manager');
        setManagers(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const payload: any = {
        name,
        email,
        role, 
      };
      if (password) payload.password = password;
      if (managerId && role === 'employee') payload.managerId = managerId;
      
      if (password) payload.password = password;
      if (managerId && role === 'employee') payload.managerId = managerId;

      await axios.put(`http://localhost:5000/api/users/${id}`, payload, {
        withCredentials: true,
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'User updated successfully',
        life: 3000,
      });

      setTimeout(() => router.push('/member/list'), 1500);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Update Failed',
        detail: 'Could not update user',
        life: 3000,
      });
    }
  };


  const roleOptions = [
    { label: 'Employee', value: 'employee' },
    { label: 'Manager', value: 'manager' },
  ];

  return (
    <div className="p-5 max-w-lg mx-auto surface-card shadow-2 border-round">
      <Toast ref={toast} />
      <h2 className="text-2xl font-semibold mb-4">Update Member</h2>
   <div className='grid'>
   <div className="md:col-6 my-1">
        <label htmlFor="name">Name</label>
        <InputText id="name" className="w-full" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="md:col-6 my-1">
        <label htmlFor="email">Email</label>
        <InputText id="email" className="w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="md:col-6 my-1">
        <label htmlFor="password">Password (optional)</label>
        <Password id="password" feedback={false} className="w-full" value={password} onChange={(e) => setPassword(e.target.value)} toggleMask />
      </div>

      <div className="md:col-6 my-1">
  <label htmlFor="role">Role</label>
  <Dropdown
    id="role"
    value={role}
    options={roleOptions}
    onChange={(e) => setRole(e.value)}
    className="w-full"
    placeholder="Select Role"
  />
</div>

      {role === 'employee' && (
        <div className="md:col-6 my-1">
          <label htmlFor="manager">Manager</label>
          <Dropdown
            id="manager"
            value={managerId}
            options={managers}
            optionLabel="name"
            optionValue="_id"
            onChange={(e) => setManagerId(e.value)}
            placeholder="Select Manager"
            className="w-full"
          />
        </div>
      )}
  <div className="col-12 text-right">
      <Button label="Update Member" className=" mt-4" onClick={handleUpdate} />
  </div>
   </div>
     
    </div>
  );
};

export default UpdateMember;
