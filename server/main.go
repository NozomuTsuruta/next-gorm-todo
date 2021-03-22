package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Todo struct {
	gorm.Model
	Text string
}

var db *gorm.DB

func init() {
	var err error
	dsn := "host=db user=root password=root dbname=next_go port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	checkErr(err)
	db.AutoMigrate(&Todo{})
}

func main() {
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}

func handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var f Todo
	if r.Method == "POST" {
		decoder := json.NewDecoder(r.Body)
		err := decoder.Decode(&f)
		checkErr(err)
	}

	switch r.URL.Path {
	case "/create":
		create(f.Text)
	case "/read":
		fmt.Println("Read")
	case "/update":
		update(int(f.ID), f.Text)
	case "/delete":
		delete(int(f.ID))
	default:
		fmt.Println("Noting")
	}
	todos := read()
	js, err := json.Marshal(todos)
	checkErr(err)
	w.Write(js)
}

func create(text string) {
	todo := Todo{Text: text}
	db.Select("Text").Create(&todo)
}

func read() []Todo {
	var todos []Todo
	db.Find(&todos)
	// checkErr(err)
	// var todo []Todo
	// for rows.Next() {
	// 	var id int
	// 	var text string
	// 	var created time.Time
	// 	err = rows.Scan(&id, &text, &created)
	// 	checkErr(err)
	// 	todo = append(todo, Todo{id, text, created})
	// }
	return todos
}

func update(id int, text string) {
	db.Model(&Todo{}).Where("ID = ?", id).Update("Text", text)
}

func delete(id int) {
	db.Delete(&Todo{}, id)
}

func checkErr(e error) {
	if e != nil {
		panic(e)
	}
}
