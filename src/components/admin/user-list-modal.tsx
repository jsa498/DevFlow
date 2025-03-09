'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  full_name?: string | null;
  email?: string;
  created_at: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
}

export function UserListModal({ isOpen, onClose, users }: UserListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User List</DialogTitle>
          <DialogDescription>
            All registered users on the platform
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No users found</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.full_name || user.user_metadata?.full_name || 'Anonymous'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
} 