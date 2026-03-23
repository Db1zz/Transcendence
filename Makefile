include .env
export

.PHONY: all up setup-elk down clean fclean re down-elk up-elk

all: up

up:
	docker compose up -d

up-elk:
	docker compose -f docker-compose.yaml -f docker-compose.elk.yaml up -d
	@$(MAKE) setup-elk

setup-elk:
	@echo "waiting for elk to wek up"
	@while ! curl -s "http://localhost:9200" > /dev/null; do \
		sleep 2; \
	done
	
	@curl -s -X POST -u "elastic:$(ELASTIC_PASSWORD)" \
		-H "Content-Type: application/json" \
		"http://localhost:9200/_security/user/kibana_system/_password" \
		-d '{"password":"$(KIBANA_PASSWORD)"}' > /dev/null

	@echo "setup log retention and archiving policies"
	@curl -s -X PUT -u "elastic:$(ELASTIC_PASSWORD)" \
		-H "Content-Type: application/json" \
		"http://localhost:9200/_ilm/policy/anteiku-retention-policy" \
		-d '{"policy":{"phases":{"hot":{"min_age":"0ms","actions":{"set_priority":{"priority":100}}},"cold":{"min_age":"30d","actions":{"readonly":{}}},"delete":{"min_age":"90d","actions":{"delete":{}}}}}}'

	@echo "\nlinking archiving"
	@curl -s -X PUT -u "elastic:$(ELASTIC_PASSWORD)" \
		-H "Content-Type: application/json" \
		"http://localhost:9200/_index_template/anteiku-logs-template" \
		-d '{"index_patterns":["anteiku-logs-*"],"template":{"settings":{"index.lifecycle.name":"anteiku-retention-policy"}}}'
	
	@echo "\nrestarting kibana"
	@docker restart anteiku-kibana > /dev/null

	@echo "wait"
	@while ! curl -s "http://localhost:5601/api/status" | grep -q '"level":"available"'; do \
		sleep 5; \
	done

	@echo "creating data view"
	@curl -s -X POST "http://localhost:5601/api/data_views/data_view" \
		-H "kbn-xsrf: true" \
		-H "Content-Type: application/json" \
		-u "elastic:$(ELASTIC_PASSWORD)" \
		-d '{"data_view": {"title": "anteiku-logs-*", "name": "Anteiku Logs", "timeFieldName": "@timestamp"}}' > /dev/null || true
	
	@echo "\nimporting dashboards to kibana"
	@curl -s -X POST "http://localhost:5601/api/saved_objects/_import?overwrite=true" \
		-H "kbn-xsrf: true" \
		-u "elastic:$(ELASTIC_PASSWORD)" \
		--form file=@./elk/kibana/anteiku_dashboard.ndjson > /dev/null
	
	@echo "\ndone with elk"

down clean:
	docker compose down

down-elk:
	docker compose -f docker-compose.yaml -f docker-compose.elk.yaml down

fclean:
	docker compose -f docker-compose.elk.yaml -f docker-compose.yaml down
	docker system prune -a -f
	docker compose -f docker-compose.elk.yaml -f docker-compose.yaml down -v

re: fclean all