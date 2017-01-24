#! /bin/bash
# MTCconnect script.

# Startup MTConnect Agent.
cd /home/debian/mapa-mtconncet/agent/
agent debug agent.cfg

# Startup Botnana-A2 Adapter.
cd /home/debian/mapa-mtconncet/adapter/
node mtcAdapter.js
