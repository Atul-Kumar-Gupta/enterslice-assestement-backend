import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import moment from 'moment'
import bodyParser from 'body-parser';

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
mongoose.set("strictQuery", false);
mongoose.connect('mongodb://localhost:27017/enterslice', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log("DB connected")
})

const userSchema = new mongoose.Schema({
    date: Date,
    status: {
        type: String,
        enum: ['PRESENT', 'ABSENT'],
        default: 'PRESENT'
    },

})
const Attendance = new mongoose.model("Attendance", userSchema)

//Routes
app.get("/", (req, res) => {
    res.send(`Server running on http://localhost:5000`)
})
app.get("/selected-date-attendance", (req, res) => {
    const { date } = req.query;
    console.log(req.body)
    Attendance.findOne({ date: date }, (err, data) => {
        if (data) {
            res.send({ attendance: data.status })
        }
        else {
            res.send({ attendance: 'ABSENT' })
        }
    })
})

app.put("/update-attendance", (req, res) => {
    const { date, status } = req.body;
    const attendance = new Attendance({
        date,
        status
    })
    Attendance.findOne({ date: date }, (err, data) => {
        if (data) {
            attendance.updateOne({ date: date }, { status: status }, err => {
                if (err) {
                    res.send(err)
                }
                else {
                    res.send({ message: "Attendance Updated Successfully" })
                }

            })
        }
        else {


            attendance.save(err => {
                if (err) {
                    res.send(err)
                }
                else {
                    res.send({ message: "Attendance Updated Successfully" })
                }

            })
        }
    })
})
app.post("/mark-attendance", (req, res) => {
    const { date, status } = req.body;
    Attendance.findOne({ date: date }, (err, data) => {
        if (data) {
            res.send({ message: "Attendance Already Marked For Same Date" })
        }
        else {
            const attendance = new Attendance({
                date,
                status
            })

            attendance.save(err => {
                if (err) {
                    res.send(err)
                }
                else {
                    res.send({ message: "Attendance Marked Successfully" })
                }

            })
        }
    })

})



app.listen(5000, () => {
    console.log('Server started at port 5000')
})