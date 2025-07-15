/** @format */

import { useEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5plugins_exporting from '@amcharts/amcharts5/plugins/exporting';

import type { IScaleLogEntry, ResponseOption } from '../../shared';
import { X } from 'lucide-react';
import { Rnd } from 'react-rnd';

interface VAScaleChartProps {
	logEntries: IScaleLogEntry[];
	bestVA?: number;
	finalVA?: number;
	onClose?: () => void;
	disableDraggable?: boolean;
}

export const VAScaleChart = ({ logEntries, bestVA, finalVA, disableDraggable, onClose }: VAScaleChartProps) => {
	const chartRef = useRef<HTMLDivElement>(null);
	const showChart = logEntries && logEntries.length > 0;

	useEffect(() => {
		if (!showChart) return;

		const root = am5.Root.new(chartRef.current!);
		root.setThemes([am5themes_Animated.new(root)]);

		const chart = root.container.children.push(
			am5xy.XYChart.new(root, {
				panX: false,
				panY: false,
				wheelX: 'none',
				wheelY: 'none',
				layout: root.verticalLayout,
			})
		);

		am5plugins_exporting.Exporting.new(root, {
			filePrefix: 'scale_chart',
			menu: am5plugins_exporting.ExportingMenu.new(root, {}),
		});

		const yAxis = chart.yAxes.push(
			am5xy.ValueAxis.new(root, {
				renderer: am5xy.AxisRendererY.new(root, { inversed: false }),
				min: -0.3,
				max: 1.1,
				strictMinMax: true,
				numberFormat: '#.0',
			})
		);

		yAxis.children.unshift(
			am5.Label.new(root, {
				text: 'LogMAR',
				rotation: -90,
				y: am5.p50,
				centerY: am5.p50,
				x: -40,
				centerX: am5.p50,
				fontSize: 14,
				fill: am5.color(0x333333),
			})
		);

		const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererX.new(root, {}) }));

		const series = chart.series.push(
			am5xy.LineSeries.new(root, {
				xAxis,
				yAxis,
				valueXField: 'trial',
				valueYField: 'logmar',
				stroke: am5.color(0x000000),
			})
		);
		series.strokes.template.setAll({ strokeWidth: 1 });

		const chartData = logEntries.map((entry, index) => ({
			trial: index + 1,
			logmar: parseFloat(entry.logmar.toFixed(2)),
			response: entry.userResponse,
		}));
		series.data.setAll(chartData);

		series.bullets.push((root, _, dataItem) => {
			const context = dataItem.dataContext as { response: ResponseOption };
			const fillColor = context.response === "I can't see" ? am5.color(0xffffff) : am5.color(0x000000);
			return am5.Bullet.new(root, {
				sprite: am5.Rectangle.new(root, {
					width: 10,
					height: 10,
					centerX: am5.p50,
					centerY: am5.p50,
					fill: fillColor,
					stroke: am5.color(0x000000),
					strokeWidth: 1,
				}),
			});
		});

		// Highlight Best VA
		if (bestVA !== undefined) {
			const dataItem = yAxis.makeDataItem({ value: bestVA });
			const range = yAxis.createAxisRange(dataItem);
			range.get('grid')?.setAll({
				stroke: am5.color(0x22c55e),
				strokeDasharray: [4, 4],
				strokeWidth: 3,
				strokeOpacity: 1,
			});
			range.get('label')?.setAll({
				text: '                      				                		Best VA',
				fill: am5.color(0x22c55e),
				centerY: am5.p50,
				x: 10,
				dy: -10,
				centerX: 0,
				isMeasured: false,
			});
		}

		// Highlight Final VA
		if (finalVA !== undefined) {
			const dataItem = yAxis.makeDataItem({ value: finalVA });
			const range = yAxis.createAxisRange(dataItem);
			range.get('grid')?.setAll({
				stroke: am5.color(0x3b82f6),
				strokeDasharray: [6, 3],
				strokeWidth: 3,
				strokeOpacity: 1,
			});
			range.get('label')?.setAll({
				text: 'Final VA',
				fill: am5.color(0x3b82f6),
				centerY: am5.p50,
				dy: -10,
				x: 10,
				centerX: 0,
				isMeasured: false,
			});
		}

		chart.set('cursor', am5xy.XYCursor.new(root, {}));

		return () => {
			root.dispose();
		};
	}, [logEntries, bestVA, finalVA, showChart]);

	const CustomLegend = () => (
		<div className='flex gap-4 px-4 py-2 border-t text-sm bg-white'>
			<div className='flex items-center gap-2'>
				<div className='w-4 h-4 bg-black rounded-sm border border-black' />
				<span>I can see</span>
			</div>
			<div className='flex items-center gap-2'>
				<div className='w-4 h-4 bg-white rounded-sm border border-black' />
				<span>I can't see</span>
			</div>
			<div className='flex items-center gap-2'>
				<div className='w-4 h-[3px] bg-green-500 border border-green-600 rounded-sm' />
				<span className='text-green-700'>Best VA</span>
			</div>
			<div className='flex items-center gap-2'>
				<div className='w-4 h-[3px] bg-blue-500 border border-blue-600 rounded-sm' />
				<span className='text-blue-700'>Final VA</span>
			</div>
		</div>
	);

	const chartPanel = (
		<div className='flex flex-col w-full h-full bg-white'>
			{!disableDraggable && (
				<div className='flex items-center justify-between px-4 py-3 border-b bg-gray-50'>
					<h3 className='text-lg font-semibold'>Scale Fast Chart</h3>
					<button className='text-gray-600 hover:text-black' onClick={onClose} title='Close'>
						<X className='w-5 h-5' />
					</button>
				</div>
			)}
			<div className='p-1 flex-1 overflow-auto'>
				{showChart ? (
					<div className='rounded border border-gray-300 h-full'>
						<div ref={chartRef} style={{ width: '100%', height: '100%' }} />
					</div>
				) : (
					<div className='text-center text-sm text-gray-500 py-10 border rounded'>Chart will appear once the game starts.</div>
				)}
			</div>
			<CustomLegend />
		</div>
	);

	if (disableDraggable) {
		return <div className='w-full h-full max-w-[600px] min-h-[400px] border rounded shadow bg-white overflow-hidden'>{chartPanel}</div>;
	}
	return (
		<Rnd default={{ x: 60, y: 55, width: 600, height: 600 }} minWidth={400} minHeight={300} bounds='window' className='z-[9999] bg-white rounded shadow-xl border overflow-hidden flex flex-col'>
			{chartPanel}
		</Rnd>
	);
};
