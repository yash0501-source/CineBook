package com.cinebook.cinebook.model;

import java.util.List;

public class TicketResponse {

private String bookingId;
private String movie;
private String theatre;
private String show;
private String user;
private List<String> seats;
private Number totalAmount;
private String status;
private String qrData;

public TicketResponse() {
}

public TicketResponse(
        String bookingId,
        String movie,
        String theatre,
        String show,
        String user,
        List<String> seats,
        Number totalAmount,
        String status,
        String qrData) {

    this.bookingId = bookingId;
    this.movie = movie;
    this.theatre = theatre;
    this.show = show;
    this.user = user;
    this.seats = seats;
    this.totalAmount = totalAmount;
    this.status = status;
    this.qrData = qrData;
}

public String getBookingId() {
    return bookingId;
}

public void setBookingId(String bookingId) {
    this.bookingId = bookingId;
}

public String getMovie() {
    return movie;
}

public void setMovie(String movie) {
    this.movie = movie;
}

public String getTheatre() {
    return theatre;
}

public void setTheatre(String theatre) {
    this.theatre = theatre;
}

public String getShow() {
    return show;
}

public void setShow(String show) {
    this.show = show;
}

public String getUser() {
    return user;
}

public void setUser(String user) {
    this.user = user;
}

public List<String> getSeats() {
    return seats;
}

public void setSeats(List<String> seats) {
    this.seats = seats;
}

public Number getTotalAmount() {
    return totalAmount;
}

public void setTotalAmount(Number totalAmount) {
    this.totalAmount = totalAmount;
}

public String getStatus() {
    return status;
}

public void setStatus(String status) {
    this.status = status;
}

public String getQrData() {
    return qrData;
}

public void setQrData(String qrData) {
    this.qrData = qrData;
}

}