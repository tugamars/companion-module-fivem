const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const net = require('net');
const struct = require('python-struct');

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.initConnection();
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		this.initConnection();
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				regex: Regex.PORT,
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}
	
	initConnection(){
		if(this.fivems){
			this.fivems.destroy();
			delete this.fivems;
		}
		
		this.updateStatus(InstanceStatus.Connecting);
		
		if(this.config.host && this.config.port){
			this.fivems=net.createConnection({
			  port: 29200,
			  host: "127.0.0.1"
			});
			
			this.fivems.on('connect', () => {
				this.updateStatus(InstanceStatus.Ok);
				
				console.log("Connected");
				
				let cmd="me test2";
				const initialData = Buffer.from([0x43, 0x4d, 0x4e, 0x44, 0x00, 0xD2, 0x00, 0x00]);
					const endian = Buffer.from(struct.pack('!h', cmd.length + 13));
					const padding = Buffer.from([0x0, 0x0]);
					const command = Buffer.from(cmd + '\n', 'utf8');
					const terminator = Buffer.from([0x00]);
					const fin = Buffer.concat([initialData, endian, padding, command, terminator]);
					this.fivems.write(fin);
			});
			
			this.fivems.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				this.log('error', err)
			});
			
			this.fivems.on('close', () => {
			  this.updateStatus(InstanceStatus.ConnectionFailure, "Connection Killed")
			  this.initinitConnection();
			});
			
		} else {
			this.updateStatus(InstanceStatus.BadConfig);
		}
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
