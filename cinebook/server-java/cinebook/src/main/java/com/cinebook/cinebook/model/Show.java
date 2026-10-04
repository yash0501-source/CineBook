package com.cinebook.cinebook.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Map;

@Document(collection = "shows")
public class Show {

    @Id
    private String id;

    @Field("movie")
    private String movie;

    @Field("theatre")
    private String theatre;

    @Field("screen")
    private String screen;

    @Field("date")
    private String date;

    @Field("time")
    private String time;

    @Field("seatPrices")
    private Map<String, Object> seatPrices;

    @Field("status")
    private String status;

    public Show() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getScreen() {
        return screen;
    }

    public void setScreen(String screen) {
        this.screen = screen;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Map<String, Object> getSeatPrices() {
        return seatPrices;
    }

    public void setSeatPrices(Map<String, Object> seatPrices) {
        this.seatPrices = seatPrices;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}