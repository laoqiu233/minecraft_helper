PROJECT_NAME=db_course_project

up:
	docker compose up -d

down:
	docker compose down

postgres:
	docker exec -it $(PROJECT_NAME)-db-1 psql -U postgres