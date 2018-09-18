
# = Woveon ============================================================
# \ \      / /____   _____  ___  _ __
#  \ \ /\ / / _ \ \ / / _ \/ _ \| '_ \
#   \ V  V / (_) \ V /  __/ (_) | | | |
#    \_/\_/ \___/ \_/ \___|\___/|_| |_|
# =====================================================================
# Test Plugin
#   by Chadwick Wingrave, chadwick@woveon.com
# Woveon test and development plugin. Runs locally.
# =====================================================================

.PHONY: .FORCE

PLUGIN_NAME=pltest
PLUGIN_TITLE="Test Plugin for Woveon"
include ../envs.mk

#all: 
#	@echo
#	@echo "*** Build and Run Microservice (pltestwl/pltestrl)"
#	@echo "'make run-{microservice}' : start the microservice"
#	@echo "'make devrun-{microservice}' : start the microservice with nodemon"
#	@echo
#	@echo "*** Utility"
#	@echo "'make envs' : print environment information"
#	@echo 
#	@echo

include ../envs_rules.mk
include ../plugin_rules.mk


#run-pltestwl: check_pass_and_secrets
#	${ENVS} npm run pltestwl
#
#run-pltestrl: check_pass_and_secrets
#	${ENVS} npm run pltestrl
#
#devrun-pltestwl: check_pass_and_secrets
#	${ENVS} npm run devpltestwl
#
#devrun-pltestrl: check_pass_and_secrets
#	${ENVS} npm run devpltestrl
