'use client';

import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import axios from 'axios';

const DeleteUserButton = ({ userId }: { userId: string }) => {
  const toast = useRef<Toast>(null);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        withCredentials: true,
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'User deleted successfully',
        life: 3000,
      });

      setTimeout(() => router.push('/member/list'), 1500);
    } catch (error) {
      console.error(error);
      toast.current?.show({
        severity: 'error',
        summary: 'Failed',
        detail: 'Could not delete user',
        life: 3000,
      });
    }
  };

  const confirmDelete = () => {
    confirmDialog({
      message: 'Are you sure you want to delete this user?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: handleDelete,
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={confirmDelete}
      />
    </>
  );
};

export default DeleteUserButton;
