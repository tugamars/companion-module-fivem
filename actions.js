const struct = require('python-struct');

module.exports = function (self) {
	self.setActionDefinitions({
		send: {
			name: 'Send Command',
			options: [
				{
					id: 'id_send',
					type: 'textinput',
					label: 'Command',
					default: '',
				},
			],
			callback: async (event) => {
				const cmd=event.options.id_send;
				
				self.log('debug', 'CMD: ' + cmd);
				
				if(cmd!=''){
					self.log('debug', 'Trying CMD: ' + cmd);
					const initialData = Buffer.from([0x43, 0x4d, 0x4e, 0x44, 0x00, 0xD2, 0x00, 0x00]);
					const endian = Buffer.from(struct.pack('!h', cmd.length + 13));
					const padding = Buffer.from([0x0, 0x0]);
					const command = Buffer.from(cmd + '\n', 'utf8');
					const terminator = Buffer.from([0x00]);
					const fin = Buffer.concat([initialData, endian, padding, command, terminator]);
					self.log('debug', "Test");
					self.fivems.write(fin);
					self.log('debug', "Sent");
				}
			},
		},
	})
}
