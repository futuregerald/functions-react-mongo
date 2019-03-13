package main

import (
	"context"
	"encoding/json"
	"log"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// BodyStruct is the shape of the inbound JSON in the request.Body
type BodyStruct struct {
	Event      string `json:"event"`
	InstanceID string `json:"instance_id"`
	User       struct {
		ID          string `json:"id"`
		Aud         string `json:"aud"`
		Role        string `json:"role"`
		Email       string `json:"email"`
		AppMetadata struct {
			Provider string `json:"provider"`
		} `json:"app_metadata"`
		UserMetadata struct {
			FullName string `json:"full_name"`
		} `json:"user_metadata"`
		CreatedAt time.Time `json:"created_at"`
		UpdatedAt time.Time `json:"updated_at"`
	} `json:"user"`
}

type userInfo struct {
	AppMetadata struct {
		Roles []string `json:"roles"`
	} `json:"app_metadata"`
}

func validateUser(email string) bool {
	s := strings.Split(email, "@")
	if len(s) == 2 && s[1] != "fakedomain.com" {
		return true
	}
	return false
}

func makeBody() string {
	userDetails := userInfo{}
	userDetails.AppMetadata.Roles = append(userDetails.AppMetadata.Roles, "netlifriend")
	var returnBody string
	if body, err := json.Marshal(userDetails); err != nil {
		log.Fatal(err)
	} else {
		returnBody = string(body)
	}
	return returnBody
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {

	var eventBody BodyStruct
	if err := json.Unmarshal([]byte(request.Body), &eventBody); err == nil {
		isValid := validateUser(eventBody.User.Email)
		if isValid {
			return &events.APIGatewayProxyResponse{
				StatusCode: 200,
				Body:       makeBody(),
			}, nil
		}
	}
	log.Print(eventBody)
	return &events.APIGatewayProxyResponse{
		StatusCode: 401,
		Body:       "Invalid User",
	}, nil
}
func main() {

	lambda.Start(handler)
}
