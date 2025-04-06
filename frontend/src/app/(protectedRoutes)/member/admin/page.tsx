'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  manager?: string;
}

const MemberList = () => {
   
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users', {
          withCredentials: true,
        });
        setUsers(res.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // 👉 Function to render Manager Name column
  const managerNameTemplate = (rowData: User) => {
    if (rowData.role === 'employee' && rowData.manager) {
      const manager = users.find((u) => u._id === rowData.manager);
      return manager ? manager.name : 'N/A';
    }
    return '-';
  };

  const actionTemplate = (rowData: User) => {
    return (
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text"
        onClick={() => router.push(`/member/edit/${rowData._id}`)}
      />
    );
  };

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card px-2">
            <div className='flex justify-content-between align-items-center '>
             <h2 className="text-xl font-semibold mb-2">Team Members</h2>
             <div>
             <Button icon={ 'pi pi-plus'} label={ 'Add New'} onClick={()=>router.push('/member/add')} className="px-1 py-2 mb-2" />
             </div>
            </div>
          <DataTable
            value={users}
            paginator
            rows={50}
            className="p-datatable-gridlines"
            size="small"
          >
            <Column field="name" header="Name" />
            <Column field="email" header="Email" />
            <Column field="role" header="Role" />
            <Column header="Manager" body={managerNameTemplate} />
            <Column body={actionTemplate} header="Actions" className="p-0" />
          </DataTable> //
        </div>
      </div>
    </div>
  );
};

export default MemberList;
