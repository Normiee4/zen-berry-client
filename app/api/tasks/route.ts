import { NextRequest } from 'next/server'
import { getTasks, createTask, updateTask, deleteTask } from '@/app/api/tasks/controller'

export async function GET(request: NextRequest) {
  return getTasks(request)
}

export async function POST(request: NextRequest) {
  return createTask(request)
}

export async function PATCH(request: NextRequest) {
  return updateTask(request)
}

export async function DELETE(request: NextRequest) {
  return deleteTask(request)
}