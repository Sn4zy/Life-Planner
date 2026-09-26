import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout.jsx'
import PageFallback from './components/PageFallback/PageFallback.jsx'

const Home = lazy(() => import('./pages/Home/Home.jsx'))
const Schedule = lazy(() => import('./pages/Schedule/Schedule.jsx'))
const Bookmarks = lazy(() => import('./pages/Bookmarks/Bookmarks.jsx'))
const Notebook = lazy(() => import('./pages/Notebook/Notebook.jsx'))
const Documents = lazy(() => import('./pages/Documents/Documents.jsx'))

function withSuspense(Page) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Page />
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={withSuspense(Home)} />
        <Route path="schedule" element={withSuspense(Schedule)} />
        <Route path="bookmarks" element={withSuspense(Bookmarks)} />
        <Route path="notebook" element={withSuspense(Notebook)} />
        <Route path="documents" element={withSuspense(Documents)} />
      </Route>
    </Routes>
  )
}
