import api from './api'
export { errMsg } from './api'

export const authService = {
  register: (data) => api.post('/register', data).then((r) => r.data),
  login: (data) => api.post('/login', data).then((r) => r.data),
  me: () => api.get('/me').then((r) => r.data),
}

export const courseService = {
  list: (params) => api.get('/courses', { params }).then((r) => r.data),
  mine: () => api.get('/courses/mine').then((r) => r.data),
  get: (id) => api.get(`/courses/${id}`).then((r) => r.data),
  create: (data) => api.post('/courses', data).then((r) => r.data),
  update: (id, data) => api.put(`/courses/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/courses/${id}`).then((r) => r.data),
  addLesson: (id, data) => api.post(`/courses/${id}/lessons`, data).then((r) => r.data),
  removeLesson: (id, lessonId) => api.delete(`/courses/${id}/lessons/${lessonId}`).then((r) => r.data),
}

export const enrollmentService = {
  enroll: (courseId) => api.post('/enroll', { courseId }).then((r) => r.data),
  myCourses: () => api.get('/my-courses').then((r) => r.data),
  setProgress: (courseId, lessonId, completed) =>
    api.put(`/my-courses/${courseId}/progress`, { lessonId, completed }).then((r) => r.data),
}

export const adminService = {
  users: () => api.get('/admin/users').then((r) => r.data),
  setRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  removeUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  analytics: () => api.get('/admin/analytics').then((r) => r.data),
}
