/** @format */

// src/components/icons/AddIcon.jsx
import Svg, { Path } from 'react-native-svg';

const TabBarWaveSvg = ({ width = 350, height = 132, color = '#fff' }) => {
	return (
		<Svg
			width={width}
			height={height}
			viewBox='0 0 413 180'
			style={{ position: 'absolute', bottom: 0 }}>
			<Path
				d={
					'M413 -4.57764e-05L413 200L3.05176e-05 200L1.61155e-05 35.2594C24.8936 19.6711 100.142 -2.96907 201.989 31.1767C303.836 65.3225 392 68.074 413 -4.57764e-05Z'
				}
				fill={color}
			/>
		</Svg>
	);
};

export default TabBarWaveSvg;
