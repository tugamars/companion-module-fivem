import { Regex } from '@companion-module/base'

export const ConfigFields = [
	{
		type: 'textinput',
		id: 'host',
		label: 'Target IP',
		width: 8,
		default: "127.0.0.1",
		regex: Regex.IP,
	},
	{
		type: 'textinput',
		id: 'port',
		label: 'Target Port',
		width: 4,
		default: 29200,
		regex: Regex.PORT,
	}
]