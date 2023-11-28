// please use postman publish link for clear understanding and Api.txt

// **** postman publish link: https://documenter.getpostman.com/view/25035029/2s9YeG5qqa




// Install express and create an instance of the app
const express=require('express');
const app=express();
const cors=require('cors')

// Middleware to parse incoming JSON data
app.use(cors());
app.use(express.json());


// Data storage for rooms and bookings
const rooms =[];
const bookings=[];


// 1.Creating a Room with
// Endpoint to create a new room
app.post('/create-room',(request,response)=>{
    const {roomName,seats,amenities,pricePerHour} =request.body

    // Creating a new room
const room={
    roomName,
    seats,
    amenities,
    pricePerHour,
    bookings:[],
}


// Add the new room to the rooms array
rooms.push(room);

response.status(201).json({messsage:"Room Created Successfully",room})

});




// 2.Booking a room with
// Endpoint to book a room
app.post('/book-room',(request,response)=>{

    const {customerName,date,startTime,endTime,roomID}=request.body;

    // Find the Room based on roomID
    const selectedroom =rooms.find((room)=>room.roomName===roomID)

    // IF the room is not found ,return a 404 error
    if(!selectedroom){
        return response.status(404).json({error:'Room Not Found',roomID});
    }

    // checking for overlapping bookings

    const overlappingBooking =selectedroom.bookings.find(
        (booking)=> booking.date===date&&
        ((startTime>=booking.startTime && startTime<booking.endTime)||
        (endTime > booking.startTime && endTime <= booking.endTime)||
        (startTime <=booking.startTime && endTime >=booking.endTime))
                   
        );
      // If there is an overlapping booking, return a 400 error
        if(overlappingBooking){
            return response.status(400).json({error:'Room already booked for the specified date and time'})
        }

        // Create a new booking object

        const newBooking ={
            customerName,
            date,
            startTime,
            endTime,
        }

        // Add the booking to the rooms booking array
        selectedroom.bookings.push(newBooking);

        // Add the booking to the global bookings array
        bookings.push({...newBooking,roomName:roomID});

        // response with a sucess message

        response.status(201).json({messsage:'Room Booked successfully',newBooking});
});





// 3. List all rooms with booked data with
// Endpoint to list all rooms with booked data
app.get('/list-rooms', (request, response) => {
    const roomList = rooms.map((room) => ({
        roomName: room.roomName,
        bookedData: room.bookings.map((booking) => ({
            bookedStatus: 'Booked',
            customerName: booking.customerName,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
        })),
    }));

    response.status(200).json(roomList);
});




// 4. List all customers with booked data
// Endpoint to list all customers with booked data
app.get('/list-customers', (request, response) => {
    const customerList = bookings.map((booking) => ({
        customerName: booking.customerName,
        roomName: booking.roomName,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
    }));

    response.status(200).json(customerList);
});



// 5. List how many times a customer has booked the room
app.get('/customer-booking-history/:customerName', (request, response) => {
    const customerName = request.params.customerName;

// trim is used for avoid new line and whitespaces
    const customerHistory = bookings
        .filter((booking) => booking.customerName.trim() === customerName.trim())
        .map((booking, index) => ({
            customerName: booking.customerName,
            roomName: booking.roomName,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            bookingID: index + 1,
            bookingDate: new Date().toISOString(),
            bookingStatus: "Confirmed",
        }));

        // adding booking count and requested customer name  for refernce
    const bookingCount = customerHistory.length;

    response.status(200).json({
        customerHistory,
        bookingCount,
        requestedCustomerName:customerName.trim(),
    });
});





//  server running port
const PORT=3001;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
});

