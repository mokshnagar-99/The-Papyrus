/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db, signIn, logOut, handleFirestoreError, OperationType } from './firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Plus, Trash2, CheckCircle2, Circle, Loader2, User } from 'lucide-react';
import { cn } from './lib/utils';

interface Task {
  id?: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp;
  userId: string;
}

function TaskManager() {
  const [user, loading, error] = useAuthState(auth);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Firestore collection reference
  const tasksRef = collection(db, 'tasks');
  
  // Query for user-specific tasks
  const tasksQuery = user 
    ? query(tasksRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
    : null;

  const [snapshots, tasksLoading, tasksError] = useCollection(tasksQuery);
  const tasks = snapshots?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

  useEffect(() => {
    if (error) console.error('Auth Error:', error);
    if (tasksError) {
      handleFirestoreError(tasksError, OperationType.LIST, 'tasks');
    }
  }, [error, tasksError]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(tasksRef, {
        title: newTaskTitle.trim(),
        completed: false,
        createdAt: serverTimestamp(),
        userId: user.uid,
      });
      setNewTaskTitle('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = async (task: Task) => {
    if (!task.id) return;
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !task.completed,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-10 rounded-[2rem] shadow-2xl shadow-white/10 max-w-md w-full text-center border border-white/20"
        >
          <div className="w-20 h-20 bg-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Secure Task Manager</h1>
          <p className="text-gray-300 mb-10 text-lg leading-relaxed">
            Organize your life with ease. Securely sync your tasks across all your devices.
          </p>
          <button
            onClick={signIn}
            className="w-full py-4 bg-cyan-400 text-black rounded-2xl font-bold text-lg hover:bg-cyan-300 transition-all flex items-center justify-center gap-3 shadow-lg shadow-cyan-400/60 active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Tasks</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-white">{user.displayName}</span>
              <span className="text-xs text-gray-400">{user.email}</span>
            </div>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-xl border-2 border-white/20" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-gray-300" />
              </div>
            )}
            <button
              onClick={logOut}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-12">
        {/* Add Task Input */}
        <form onSubmit={addTask} className="mb-12">
          <div className="relative group">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-gray-800 border-2 border-transparent focus:border-blue-600 rounded-3xl py-5 px-8 pr-20 text-xl shadow-xl shadow-white/10 outline-none transition-all placeholder:text-gray-500 text-white"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim() || isSubmitting}
              className="absolute right-3 top-3 bottom-3 bg-cyan-400 text-black px-6 rounded-2xl font-bold hover:bg-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-400 transition-all flex items-center justify-center shadow-lg shadow-cyan-400/60"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6" />}
            </button>
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Your Tasks</h2>
          
          {tasksLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : tasks?.length === 0 ? (
            <div className="text-center py-20 bg-gray-800 rounded-[2rem] border-2 border-dashed border-gray-600">
              <p className="text-gray-400 text-lg">No tasks yet. Add one above!</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {tasks?.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group bg-gray-800 p-6 rounded-3xl flex items-center gap-4 transition-all border-2 border-transparent hover:border-white/20 hover:shadow-xl hover:shadow-white/10",
                    task.completed && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => toggleTask(task as Task)}
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-white/10",
                      task.completed ? "bg-purple-500 text-white" : "bg-cyan-400 text-black group-hover:text-cyan-900"
                    )}
                  >
                    {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  
                  <span className={cn(
                    "flex-1 text-lg font-medium text-white transition-all",
                    task.completed && "line-through text-gray-500"
                  )}>
                    {task.title}
                  </span>

                  <button
                    onClick={() => task.id && deleteTask(task.id)}
                    className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TaskManager />
    </ErrorBoundary>
  );
}
