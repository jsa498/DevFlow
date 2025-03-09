'use client';

import { useState } from 'react';
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
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const name = (user.full_name || user.user_metadata?.full_name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || email.includes(query);
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User List</DialogTitle>
          <DialogDescription>
            All registered users on the platform
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative my-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
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
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    {searchQuery ? 'No users match your search' : 'No users found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
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