import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import formationRoutes from './routes/formations.js'
import moduleRoutes from './routes/modules.js'
import quizzRoutes from './routes/quizz.js'
import progressRoutes from './routes/progress.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('API OK'))

app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/formations', formationRoutes)
app.use('/modules', moduleRoutes)
app.use('/quizz', quizzRoutes)
app.use('/progress', progressRoutes)

app.listen(3000, () => console.log('Server running on :3000'))
