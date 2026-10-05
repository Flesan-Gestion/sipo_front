<template>
	<div class="sipo-ficha-ingreso relative w-full flex-1">
		<div class="ficha-print-area flex flex-column gap-3 p-3">
			<div class="ficha-doc-header border-1 border-300 border-round bg-white p-3">
				<div class="ficha-doc-brand flex flex-column sm:flex-row justify-content-between align-items-center gap-3 mb-3">
					<img :src="logoGrupoFicha" alt="Grupo Flesan" class="ficha-logo-grupo" />
					<div class="text-right text-sm line-height-3 flex-shrink-0">
						<div><strong>Cód:</strong> P-RH-01</div>
						<div><strong>Anexo:</strong> 02</div>
					</div>
				</div>
				<h2 class="m-0 text-center text-xl font-bold uppercase text-900">
					{{ editingId ? `Ficha de Ingreso de Personal #${editingId}` : 'Ficha de Ingreso de Personal' }}
				</h2>
			</div>

			<section v-show="paso === 'rrhh' && !isSupervisor" class="ficha-section border-1 border-300 border-round bg-white p-3">
				<h3 class="ficha-section__title">
					1. Datos a completar por Recursos Humanos y Área Solicitante
				</h3>
				<div class="grid formgrid p-fluid">
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Razón Social</label>
						<Dropdown
							v-model="form.seccion1.razonSocial"
							:options="razonSocialOptions"
							optionLabel="label"
							optionValue="value"
							filter
							showClear
							placeholder="Seleccionar razón social"
							:class="fc('razonSocial')"
							:loading="loadingMaestros"
							@change="onRazonSocialChange"
						/>
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Obra</label>
						<Dropdown
							v-model="form.seccion1.obra"
							:options="obraOptions"
							optionLabel="label"
							optionValue="value"
							filter
							showClear
							placeholder="Seleccionar obra"
							:class="fc('obra')"
							:disabled="!form.seccion1.razonSocial"
						/>
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Centro de Costo</label>
						<Dropdown
							v-model="form.seccion1.centroCosto"
							:options="centroCostoOptions"
							optionLabel="label"
							optionValue="value"
							filter
							showClear
							placeholder="Seleccionar centro de costo"
							:class="fc('centroCosto')"
							:disabled="!form.seccion1.razonSocial"
							@change="onCentroCostoChange"
						/>
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Descripción Centro Costo</label>
						<Dropdown
							v-model="form.seccion1.descripcionCentroCosto"
							:options="descripcionCentroOptions"
							optionLabel="label"
							optionValue="value"
							filter
							showClear
							placeholder="Seleccionar descripción"
							:class="fc('descripcionCentroCosto')"
							:disabled="!form.seccion1.razonSocial"
							@change="onDescripcionCentroChange"
						/>
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Jefe Directo</label>
						<Dropdown
							v-model="form.seccion1.jefeUserId"
							:options="jefesOptions"
							optionLabel="label"
							optionValue="user_id"
							filter
							showClear
							placeholder="Seleccionar"
							:class="fc('jefeUserId')"
							:loading="loadingJefes"
							:disabled="!form.seccion1.centroCosto"
							emptyMessage="Sin personal activo en este centro de costo"
							emptyFilterMessage="Sin resultados"
							@change="onJefeChange"
						/>
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Correo Jefe Directo</label>
						<InputText
							v-model="form.seccion1.correoJefeDirecto"
							type="email"
							:class="fc('correoJefeDirecto', emailErrors.correoJefeDirecto)"
							:disabled="validatingEmail.correoJefeDirecto"
							placeholder="correo@empresa.cl"
							@input="clearEmailError('correoJefeDirecto')"
							@blur="validateEmailField('correoJefeDirecto', form.seccion1.correoJefeDirecto)"
						/>
						<small v-if="validatingEmail.correoJefeDirecto" class="text-xs text-color-secondary block mt-1">
							Verificando correo...
						</small>
						<small v-else-if="emailErrors.correoJefeDirecto" class="p-error block mt-1">
							{{ emailErrors.correoJefeDirecto }}
						</small>
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Correo Administrador de Obra</label>
						<InputText
							v-model="form.seccion1.correoAdminObra"
							type="email"
							:class="fc('correoAdminObra', emailErrors.correoAdminObra)"
							:disabled="validatingEmail.correoAdminObra"
							placeholder="correo@empresa.cl"
							@input="clearEmailError('correoAdminObra')"
							@blur="validateEmailField('correoAdminObra', form.seccion1.correoAdminObra)"
						/>
						<small v-if="validatingEmail.correoAdminObra" class="text-xs text-color-secondary block mt-1">
							Verificando correo...
						</small>
						<small v-else-if="emailErrors.correoAdminObra" class="p-error block mt-1">
							{{ emailErrors.correoAdminObra }}
						</small>
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Cuenta de gasto</label>
						<Dropdown
							v-model="form.seccion3.cuentaGasto"
							:options="maestros.cuentas_gasto"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar"
							:class="fc('cuentaGasto')"
							showClear
						/>
					</div>
				</div>
			</section>

			<section
				v-show="paso === 'supervisor' || paso === 'colaborador' || (paso === 'rrhh' && !isSupervisor)"
				class="ficha-section border-1 border-300 border-round bg-white p-3"
			>
				<h3 class="ficha-section__title">Datos a completar por Supervisor</h3>
				<div class="grid formgrid p-fluid">
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Cargo</label>
						<Dropdown
							v-model="form.seccion1.cargo"
							:options="cargoOptions"
							optionLabel="label"
							optionValue="value"
							filter
							showClear
							placeholder="Seleccionar cargo"
							:class="fc('cargo')"
							:loading="loadingCargos"
							:disabled="bloqueoCamposSupervisor"
							emptyMessage="Sin cargos disponibles"
						/>
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Fecha de ingreso</label>
						<Calendar v-model="form.seccion1.fechaIngreso" dateFormat="dd-mm-yy" :class="fc('fechaIngreso')" showIcon :disabled="bloqueoCamposSupervisor" />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Correo Electrónico del Colaborador</label>
						<InputText
							v-model="form.seccion1.correoColaborador"
							type="email"
							:class="fc('correoColaborador')"
							placeholder="correo@empresa.cl"
							:disabled="bloqueoCamposSupervisor"
						/>
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Sueldo Líquido (NO costo empresa)</label>
						<InputNumber
							v-model="form.seccion3.sueldoLiquido"
							mode="currency"
							currency="CLP"
							locale="es-CL"
							:min="0"
							:max="SUELDO_MAX"
							:class="fc('sueldoLiquido', sueldoError)"
							:disabled="bloqueoCamposSupervisor"
							@update:modelValue="onSueldoChange"
						/>
						<small v-if="sueldoError" class="p-error block mt-1">{{ sueldoError }}</small>
						<small v-else class="text-color-secondary block mt-1">Mínimo $585.000</small>
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Tipo de contrato</label>
						<Dropdown
							v-model="form.seccion3.tipoContrato"
							:options="tiposContratoOptions"
							optionLabel="label"
							optionValue="value"
							:class="fc('tipoContrato')"
							:disabled="bloqueoCamposSupervisor"
							@change="onTipoContratoChange"
						/>
					</div>
					<div v-if="isObraFaena" class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) HITO</label>
						<InputText v-model="hitoTexto" :class="fc('hitoTexto')" :disabled="bloqueoCamposSupervisor" />
					</div>
					<div v-if="isObraFaena" class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Fecha de término HITO</label>
						<Calendar v-model="fechaTerminoHito" dateFormat="dd-mm-yy" showIcon :class="fc('fechaTerminoHito')" :disabled="bloqueoCamposSupervisor" />
					</div>
					<div v-if="isPlazoFijo" class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Fecha término plazo fijo</label>
						<Calendar v-model="plazoFijoFecha" dateFormat="dd-mm-yy" showIcon :class="fc('plazoFijoFecha')" :disabled="bloqueoCamposSupervisor" />
					</div>
					<div class="field col-12 md:col-6">
						<label class="font-semibold text-sm">(*) Horario de trabajo</label>
						<Dropdown
							v-model="form.seccion3.horario"
							:options="horarioOptions"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar horario"
							:class="fc('horario')"
							showClear
							:disabled="bloqueoCamposSupervisor"
							:loading="loadingHorarios"
							emptyMessage="Sin horarios disponibles"
						/>
					</div>
					<div class="field col-12">
						<label class="font-semibold text-sm">Observaciones</label>
						<Textarea v-model="form.seccion3.observaciones" rows="4" class="w-full" autoResize :disabled="bloqueoCamposSupervisor" />
					</div>
				</div>
			</section>

		<section v-show="paso === 'enlace'" class="ficha-section border-1 border-300 border-round bg-white p-4">
			<h3 class="ficha-section__title">Datos ingresados por el Supervisor</h3>
			<div class="grid mt-3">
				<div class="col-12 md:col-4"><span class="text-color-secondary text-sm">Cargo</span><div>{{ form.seccion1.cargo || '—' }}</div></div>
				<div class="col-12 md:col-4"><span class="text-color-secondary text-sm">Fecha de ingreso</span><div>{{ formatFechaCl(form.seccion1.fechaIngreso) }}</div></div>
				<div class="col-12 md:col-4"><span class="text-color-secondary text-sm">Correo del colaborador</span><div>{{ form.seccion1.correoColaborador || '—' }}</div></div>
				<div class="col-12 md:col-4"><span class="text-color-secondary text-sm">Sueldo líquido</span><div>{{ formatSueldoPaso(form.seccion3.sueldoLiquido) }}</div></div>
				<div class="col-12 md:col-4"><span class="text-color-secondary text-sm">Tipo de contrato</span><div>{{ form.seccion3.tipoContrato || '—' }}</div></div>
				<div class="col-12 md:col-4"><span class="text-color-secondary text-sm">Horario</span><div>{{ labelOf(horarioOptions, form.seccion3.horario) || form.seccion3.horario || '—' }}</div></div>
				<div v-if="isPlazoFijo" class="col-12 md:col-4"><span class="text-color-secondary text-sm">Término plazo fijo</span><div>{{ formatFechaCl(plazoFijoFecha) }}</div></div>
				<div v-if="isObraFaena" class="col-12 md:col-4"><span class="text-color-secondary text-sm">HITO</span><div>{{ hitoTexto || '—' }}</div></div>
				<div v-if="isObraFaena" class="col-12 md:col-4"><span class="text-color-secondary text-sm">Fecha término HITO</span><div>{{ formatFechaCl(fechaTerminoHito) }}</div></div>
				<div v-if="form.seccion3.observaciones" class="col-12"><span class="text-color-secondary text-sm">Observaciones</span><div>{{ form.seccion3.observaciones }}</div></div>
			</div>
			<div class="flex flex-column align-items-center gap-3 mt-4 pt-4 border-top-1 border-300">
				<img v-if="enlaceQr" :src="enlaceQr" alt="Código QR" class="w-12rem" />
				<a
					v-if="enlaceUrl"
					:href="enlaceUrl"
					target="_blank"
					rel="noopener noreferrer"
					class="m-0 text-sm text-center"
				>{{ enlaceUrl }}</a>
				<div class="flex gap-2">
					<Button label="Copiar enlace" icon="pi pi-copy" size="small" @click="copiarEnlace" />
					<Button label="Volver" severity="secondary" outlined size="small" @click="paso = 'supervisor'" />
				</div>
				<small class="text-color-secondary">Esperando los datos del colaborador…</small>
			</div>
		</section>

		<section
			v-show="(!isSupervisor && paso === 'rrhh') || (isSupervisor && paso === 'colaborador')"
			class="ficha-section border-1 border-300 border-round bg-white p-3"
		>
			<div class="flex align-items-center justify-content-between mb-2 gap-2 flex-wrap">
				<h3 class="ficha-section__title m-0">2. Datos del Nuevo Colaborador</h3>
				<Button
					v-if="!isSupervisor"
					label="Escanear Cédula"
					icon="pi pi-id-card"
					size="small"
					@click="qrScannerVisible = true"
				/>
			</div>
			<fieldset :disabled="isSupervisor" class="ficha-fieldset-readonly border-none p-0 m-0">
			<div class="grid formgrid p-fluid">
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Nombres</label>
						<InputText v-model="form.seccion2.nombres" :class="fc('nombres')" />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Primer Apellido</label>
						<InputText v-model="form.seccion2.apellidoPaterno" :class="fc('apellidoPaterno')" />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Segundo Apellido</label>
						<InputText v-model="form.seccion2.apellidoMaterno" :class="fc('apellidoMaterno')" />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) RUT</label>
						<InputText
							v-model="form.seccion2.rut"
							:class="fc('rut', rutWarning)"
							maxlength="13"
							placeholder="12.345.678-9"
							@input="onRutInput"
							@blur="onRutBlur"
						/>
						<small v-if="rutWarning" class="p-error block">{{ rutWarning }}</small>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Género</label>
						<Dropdown
							v-model="form.seccion2.genero"
							:options="GENERO_OPTIONS"
							optionLabel="label"
							optionValue="value"
							placeholder="Seleccionar"
							:class="fc('genero')"
							showClear
							@change="onGeneroChange"
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Tratamiento</label>
						<Dropdown
							v-model="form.seccion2.tratamiento"
							:options="TRATAMIENTO_OPTIONS"
							optionLabel="label"
							optionValue="value"
							placeholder="Seleccionar"
							:class="fc('tratamiento')"
							showClear
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Fecha de Nacimiento</label>
						<Calendar
							v-model="form.seccion2.fechaNacimiento"
							dateFormat="dd-mm-yy"
							:class="fc('fechaNacimiento')"
							showIcon
							:maxDate="maxFechaNacimiento"
							@date-select="onFechaNacimientoChange"
							@blur="onFechaNacimientoChange"
						/>
						<small class="text-color-secondary block mt-1">Solo mayores de 18 años</small>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Edad</label>
						<InputNumber v-model="form.seccion2.edad" :class="fc('edad')" :min="18" :max="99" :disabled="true" />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Nacionalidad</label>
						<Dropdown
							v-model="form.seccion2.nacionalidad"
							:options="maestros.nacionalidades"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar"
							:class="fc('nacionalidad')"
							showClear
							@change="onNacionalidadChange"
						/>
					</div>
					<div v-if="showNacionalidadExt" class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Nacionalidad extranjera</label>
						<Dropdown
							v-model="form.seccion2.nacionalidadExt"
							:options="maestros.nacionalidades_extranjeras"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar"
							:class="fc('nacionalidadExt')"
							showClear
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) País de nacimiento</label>
						<Dropdown
							v-model="form.seccion2.paisNacimiento"
							:options="paisNacimientoOptions"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar"
							:class="fc('paisNacimiento')"
							showClear
							@change="onPaisNacimientoChange"
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Región de nacimiento</label>
						<Dropdown
							v-model="form.seccion2.regionNacimiento"
							:options="regionNacimientoOptions"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar"
							:class="fc('regionNacimiento')"
							showClear
							:disabled="!form.seccion2.paisNacimiento"
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) AFP</label>
						<Dropdown
							v-model="form.seccion2.afp"
							:options="maestros.afps"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar AFP"
							:class="fc('afp')"
							showClear
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Isapre / Fonasa</label>
						<Dropdown
							v-model="form.seccion2.isapreFonasa"
							:options="maestros.sistemas_salud"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar previsión de salud"
							:class="fc('isapreFonasa')"
							showClear
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Jubilado</label>
						<Dropdown
							v-model="form.seccion2.jubilado"
							:options="JUBILADO_OPTIONS"
							optionLabel="label"
							optionValue="value"
							placeholder="Seleccionar"
							:class="fc('jubilado')"
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Estado Civil</label>
						<Dropdown
							v-model="form.seccion2.estadoCivil"
							:options="maestros.estados_civiles"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar estado civil"
							:class="fc('estadoCivil')"
							showClear
							@change="onEstadoCivilChange"
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Teléfono Particular o Celular</label>
						<div class="flex w-full telefono-input-group">
							<span class="telefono-prefix">569</span>
							<InputText
								:value="telefonoLocal"
								:class="['w-full', 'telefono-input', { 'p-invalid': fieldErrors.telefono }]"
								inputmode="numeric"
								maxlength="8"
								placeholder="12345678"
								@input="onTelefonoInput"
							/>
						</div>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Nombre calle</label>
						<InputText v-model="form.seccion2.domicilio" :class="fc('domicilio')" />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Número dirección</label>
						<InputText v-model="form.seccion2.numeroDireccion" :class="fc('numeroDireccion')" />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">Villa / población</label>
						<InputText v-model="form.seccion2.villa" class="w-full" />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">N° departamento</label>
						<InputText v-model="form.seccion2.numDepto" class="w-full" />
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Región</label>
						<Dropdown
							v-model="form.seccion2.region"
							:options="maestros.regiones"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar región"
							:class="fc('region')"
							showClear
							@change="onRegionChange"
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Ciudad</label>
						<Dropdown
							v-model="form.seccion2.ciudad"
							:options="ciudadOptions"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar ciudad"
							:class="fc('ciudad')"
							showClear
							:disabled="!form.seccion2.region"
							@change="onCiudadChange"
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Comuna</label>
						<Dropdown
							v-model="form.seccion2.comuna"
							:options="comunaOptions"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar comuna"
							:class="fc('comuna')"
							showClear
							:disabled="!form.seccion2.ciudad"
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) E-mail Personal</label>
						<InputText
							v-model="form.seccion2.emailPersonal"
							type="email"
							:class="fc('emailPersonal', emailErrors.emailPersonal)"
							:disabled="validatingEmail.emailPersonal"
							@input="clearEmailError('emailPersonal')"
							@blur="validateEmailField('emailPersonal', form.seccion2.emailPersonal)"
						/>
						<small v-if="validatingEmail.emailPersonal" class="text-xs text-color-secondary block mt-1">
							Verificando correo...
						</small>
						<small v-else-if="emailErrors.emailPersonal" class="p-error block mt-1">
							{{ emailErrors.emailPersonal }}
						</small>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Método de pago</label>
						<Dropdown
							v-model="form.seccion2.metodoPago"
							:options="maestros.metodos_pago"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar"
							:class="fc('metodoPago')"
							showClear
							@change="onMetodoPagoChange"
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) Banco</label>
						<Dropdown
							v-model="form.seccion2.banco"
							:options="maestros.bancos"
							optionLabel="label"
							optionValue="value"
							filter
							placeholder="Seleccionar banco"
							:class="fc('banco')"
							showClear
						/>
					</div>
					<div class="field col-12 md:col-4">
						<label class="font-semibold text-sm">(*) N° Cta. Bancaria</label>
						<InputText
							v-model="form.seccion2.numeroCuentaBancaria"
							:class="fc('numeroCuenta')"
						/>
					</div>
				</div>
			</fieldset>
			</section>

			<section
				v-show="(!isSupervisor && paso === 'rrhh') || (isSupervisor && paso === 'colaborador')"
				class="ficha-section border-1 border-300 border-round bg-white p-3"
			>
				<h3 class="ficha-section__title">Documentos del colaborador</h3>
				<div class="grid formgrid">
					<div v-for="doc in documentosSlots" :key="doc.key" class="field col-12 md:col-6 flex flex-column gap-1">
						<label class="font-semibold text-sm mb-0">{{ doc.label }}</label>
						<button
							v-if="docMeta[doc.key]?.url"
							type="button"
							class="p-0 border-none bg-transparent text-primary underline cursor-pointer text-left text-sm align-self-start"
							@click="openDocumento(docMeta[doc.key].url)"
						>
							{{ docMeta[doc.key].name }}
						</button>
						<small v-else-if="docMeta[doc.key]" class="text-color-secondary">
							{{ docMeta[doc.key].name }}
						</small>
						<small v-else class="text-color-secondary">Sin archivo</small>
					</div>
				</div>
			</section>

			<div class="ficha-actions flex flex-wrap justify-content-end gap-2 no-print">
				<Button
					label="Volver"
					icon="pi pi-arrow-left"
					severity="secondary"
					outlined
					@click="router.push({ name: 'SipoFichaIngresoHistorial' })"
				/>
				<Button
					v-if="paso === 'rrhh' && !isSupervisor"
					label="Imprimir / Exportar"
					icon="pi pi-print"
					severity="secondary"
					outlined
					@click="onPrint"
				/>
				<Button
					v-if="paso === 'supervisor' && (isSupervisor || !isEditMode)"
					label="Siguiente"
					icon="pi pi-arrow-right"
					iconPos="right"
					severity="success"
					:loading="generandoQr"
					@click="generarEnlaceCandidato"
				/>
				<Button
					v-if="paso === 'rrhh' && puedeEnviarJefe && !isSupervisor"
					label="Enviar a Jefe de Terreno"
					icon="pi pi-send"
					severity="success"
					:loading="saving"
					:disabled="isSavingBlocked"
					@click="enviarAJefe"
				/>
			</div>
		</div>
	</div>

	<SipoQrScannerModal
		v-model:visible="qrScannerVisible"
		@scanned="onCedulaScanned"
	/>
	<Dialog v-model:visible="enlaceVisible" modal header="Enlace del colaborador" :style="{ width: '26rem' }">
		<div class="flex flex-column align-items-center gap-3">
			<img v-if="enlaceQr" :src="enlaceQr" alt="Código QR" class="w-12rem" />
			<a
				v-if="enlaceUrl"
				:href="enlaceUrl"
				target="_blank"
				rel="noopener noreferrer"
				class="m-0 text-sm text-center word-break"
			>{{ enlaceUrl }}</a>
			<Button label="Copiar enlace" icon="pi pi-copy" size="small" @click="copiarEnlace" />
			<small class="text-color-secondary text-center">
				Cuando el colaborador guarde, esta sección se actualiza sola.
			</small>
		</div>
	</Dialog>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useGlobalStore } from '../../../store/global';
import { useSecurityStore } from '../../../store/security';
import { RolesEnum } from '../../../shared/enums/roles.enum';
import { useToastStore } from '../../../store/toast';
import {
	ToastGroupEnum,
	ToastSeverityMessageEnum,
} from '../../../shared/interfaces/toast-message.interface';
import { formatRut, filterRutInput, isValidRut } from '../../../utils/formatRut';
import { SipoService } from '../services/SipoService';
import { SipoFichasService } from '../services/SipoFichasService';
import { SipoConfigCargosService } from '../services/SipoConfigCargosService';
import { SipoMaestroEmpresa, TRATAMIENTO_OPTIONS, GENERO_OPTIONS, TIPO_CONTRATO_OPTIONS, EXTERNAL_CODE_PAIS_CHILE, EXTERNAL_CODE_PAIS_GRUPO_2, normalizeGeneroValue } from '../sipoConstants';

const JUBILADO_OPTIONS = [
	{ label: 'Sí', value: true },
	{ label: 'No', value: false },
];
import SipoQrScannerModal, { type CedulaData } from '../components/SipoQrScannerModal.vue';
import { formatPersonName, missingCedulaFields } from '../utils/parseCedulaAnverso';
import { findOptionValue } from '../utils/mapFichaToCandidato';
import logoGrupoFicha from '../../../assets/img/logo_grupo_flesan.png';

const qrScannerVisible = ref(false);
const generandoQr = ref(false);
const paso = ref<'supervisor' | 'enlace' | 'rrhh' | 'colaborador'>('supervisor');
const security = useSecurityStore();
const isSupervisor = computed(
	() => Number(security.user?.sip_rol_id) === RolesEnum.SUPERVISOR
);
const bloqueoCamposSupervisor = computed(() =>
	isSupervisor.value ? paso.value !== 'supervisor' : paso.value === 'rrhh'
);
const fichaEstado = ref('');
const puedeEnviarJefe = computed(() => fichaEstado.value === 'PENDIENTE_RRHH');
const enlaceVisible = ref(false);
const enlaceUrl = ref('');
const enlaceQr = ref('');
let fichaPoll: ReturnType<typeof setInterval> | null = null;

const SUELDO_MIN = 585_000;
const SUELDO_MAX = 99_999_999;
const TELEFONO_PREFIX = '569';
const ALLOWED_EXT = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp']);
const MAX_MB = 4;

type EmailFieldKey = 'correoJefeDirecto' | 'correoAdminObra' | 'emailPersonal';
type DocKey =
	| 'comprobanteDomicilio'
	| 'certificadoTitulo'
	| 'certificadoAfp'
	| 'certificadoSalud'
	| 'copiaCedula';

const global = useGlobalStore();
const router = useRouter();
const route = useRoute();

const editingId = computed(() => {
	const raw = route.params.id;
	const n = Number(Array.isArray(raw) ? raw[0] : raw);
	return Number.isFinite(n) && n > 0 ? n : null;
});
const isEditMode = computed(() => route.name === 'SipoFichaIngresoEdit' && editingId.value != null);

const loadingMaestros = ref(false);
const loadingCargos = ref(false);
const loadingJefes = ref(false);
const jefesOptions = ref<{ user_id: string; nombre: string; correo: string; label: string }[]>([]);
const saving = ref(false);
const sueldoError = ref('');
const rutWarning = ref('');
const telefonoLocal = ref('');
const uploadingDoc = ref<DocKey | null>(null);
const docFiles = reactive<Partial<Record<DocKey, File>>>({});
const empresas = ref<SipoMaestroEmpresa[]>([]);
const selectedPais = ref(EXTERNAL_CODE_PAIS_GRUPO_2);
const ubicaciones = ref<{ external_code: string; nombre: string }[]>([]);
const cargos = ref<{ external_code: string; nombre: string }[]>([]);

const emailErrors = reactive<Record<EmailFieldKey, string>>({
	correoJefeDirecto: '',
	correoAdminObra: '',
	emailPersonal: '',
});
const validatingEmail = reactive<Record<EmailFieldKey, boolean>>({
	correoJefeDirecto: false,
	correoAdminObra: false,
	emailPersonal: false,
});

const docErrors = reactive<Record<string, string>>({});
const docMeta = reactive<Record<string, { name: string; sizeMb: string; url?: string }>>({});

const maestros = reactive<Record<string, any[]>>({
	afps: [],
	sistemas_salud: [],
	estados_civiles: [],
	bancos: [],
	tipos_cuenta: [],
	metodos_pago: [],
	regiones: [],
	paises_region_nacimiento: [],
	nacionalidades: [],
	nacionalidades_extranjeras: [],
	cuentas_gasto: [],
	tipos_contrato: [],
	horarios: [],
});

const hitoTexto = ref('');
const plazoFijoFecha = ref<Date | null>(null);
const fechaTerminoHito = ref<Date | null>(null);
const loadingHorarios = ref(false);
const horariosEmpresa = ref<{ label: string; value: string }[]>([]);

const documentosSlots = [
	{ key: 'comprobanteDomicilio' as const, label: '(*) Comprobante de Domicilio' },
	{ key: 'certificadoTitulo' as const, label: 'Certificado de Título (Opcional)' },
	{ key: 'certificadoAfp' as const, label: '(*) Certificado AFP' },
	{ key: 'certificadoSalud' as const, label: '(*) Certificado Salud' },
	{ key: 'copiaCedula' as const, label: '(*) Cédula de Identidad' },
];

const form = reactive({
	seccion1: {
		razonSocial: null as string | null,
		obra: null as string | null,
		centroCosto: null as string | null,
		descripcionCentroCosto: null as string | null,
		cargo: null as string | null,
		fechaIngreso: null as Date | null,
		correoJefeDirecto: '',
		correoAdminObra: '',
		jefeUserId: null as string | null,
		jefeNombre: null as string | null,
		jefeCorreo: null as string | null,
		correoColaborador: '',
	},
	seccion2: {
		nombres: '',
		apellidoPaterno: '',
		apellidoMaterno: '',
		rut: '',
		tratamiento: null as string | null,
		genero: null as string | null,
		afp: null as string | null,
		isapreFonasa: null as string | null,
		jubilado: null as boolean | null,
		estadoCivil: null as string | null,
		edad: null as number | null,
		fechaNacimiento: null as Date | null,
		paisNacimiento: null as string | null,
		regionNacimiento: null as string | null,
		nacionalidad: null as string | null,
		nacionalidadExt: null as string | null,
		telefono: '',
		domicilio: '',
		villa: '',
		numeroDireccion: '',
		numDepto: '',
		region: null as string | null,
		ciudad: null as string | null,
		comuna: null as string | null,
		emailPersonal: '',
		banco: null as string | null,
		metodoPago: null as string | null,
		numeroCuentaBancaria: '',
	},
	seccion3: {
		sueldoLiquido: null as number | null,
		diasContrato: null as number | null,
		cuentaGasto: null as string | null,
		tipoContrato: 'Plazo Fijo' as string,
		horario: null as string | null,
		documentos: {
			comprobanteDomicilio: null as string | null,
			certificadoTitulo: null as string | null,
			certificadoAfp: null as string | null,
			certificadoSalud: null as string | null,
			copiaCedula: null as string | null,
		},
		observaciones: '',
	},
});

const maxFechaNacimiento = computed(() => {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setFullYear(d.getFullYear() - 18);
	return d;
});

const isSavingBlocked = computed(
	() =>
		saving.value ||
		Boolean(sueldoError.value) ||
		Boolean(rutWarning.value) ||
		Object.values(emailErrors).some(Boolean) ||
		Object.values(validatingEmail).some(Boolean)
);

const fieldErrors = reactive<Record<string, string>>({});

const isEmptyValue = (value: unknown): boolean => {
	if (value === null || value === undefined) return true;
	if (value instanceof Date) return Number.isNaN(value.getTime());
	if (typeof value === 'string') return value.trim() === '';
	if (typeof value === 'boolean') return false;
	return false;
};

const clearFieldErrors = () => {
	Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k]);
};

const fc = (key: string, extraInvalid?: unknown) => [
	'w-full',
	{ 'p-invalid': Boolean(fieldErrors[key]) || Boolean(extraInvalid) },
];

const showObligatoriosToast = () => {
	global.utl.genCustomeToast(
		ToastSeverityMessageEnum.WARN,
		'Ficha de Ingreso',
		'Por favor complete todos los campos obligatorios (*) antes de continuar.'
	);
};

const markRequired = (key: string, value: unknown) => {
	if (isEmptyValue(value)) {
		fieldErrors[key] = 'Campo obligatorio';
		return false;
	}
	delete fieldErrors[key];
	return true;
};

const validateRequiredFields = (): boolean => {
	clearFieldErrors();
	let ok = true;
	const s1 = form.seccion1;
	const s2 = form.seccion2;
	const s3 = form.seccion3;
	const checks: Array<[string, unknown]> = [
		['razonSocial', s1.razonSocial],
		['obra', s1.obra],
		['centroCosto', s1.centroCosto],
		['descripcionCentroCosto', s1.descripcionCentroCosto || s1.centroCosto],
		['cargo', s1.cargo],
		['jefeUserId', s1.jefeUserId],
		['fechaIngreso', s1.fechaIngreso],
		['correoJefeDirecto', s1.correoJefeDirecto],
		['correoAdminObra', s1.correoAdminObra],
		['correoColaborador', s1.correoColaborador],
		['nombres', s2.nombres],
		['apellidoPaterno', s2.apellidoPaterno],
		['apellidoMaterno', s2.apellidoMaterno],
		['rut', s2.rut],
		['genero', s2.genero],
		['tratamiento', s2.tratamiento],
		['fechaNacimiento', s2.fechaNacimiento],
		['edad', s2.edad],
		['nacionalidad', s2.nacionalidad],
		['paisNacimiento', s2.paisNacimiento],
		['regionNacimiento', s2.regionNacimiento],
		['afp', s2.afp],
		['isapreFonasa', s2.isapreFonasa],
		['jubilado', s2.jubilado],
		['estadoCivil', s2.estadoCivil],
		['telefono', telefonoLocal.value],
		['domicilio', s2.domicilio],
		['numeroDireccion', s2.numeroDireccion],
		['region', s2.region],
		['ciudad', s2.ciudad],
		['comuna', s2.comuna],
		['emailPersonal', s2.emailPersonal],
		['metodoPago', s2.metodoPago],
		['banco', s2.banco],
		['numeroCuenta', s2.numeroCuentaBancaria],
		['sueldoLiquido', s3.sueldoLiquido],
		['cuentaGasto', s3.cuentaGasto],
		['tipoContrato', s3.tipoContrato],
		['horario', s3.horario],
	];
	for (const [key, value] of checks) {
		if (!markRequired(key, value)) ok = false;
	}
	if (showNacionalidadExt.value) {
		if (!markRequired('nacionalidadExt', s2.nacionalidadExt)) ok = false;
	}
	if (isObraFaena.value) {
		if (!markRequired('hitoTexto', hitoTexto.value)) ok = false;
		if (!markRequired('fechaTerminoHito', fechaTerminoHito.value)) ok = false;
	}
	if (isPlazoFijo.value) {
		if (!markRequired('plazoFijoFecha', plazoFijoFecha.value)) ok = false;
	}
	const requiredDocs: DocKey[] = [
		'comprobanteDomicilio',
		'certificadoAfp',
		'certificadoSalud',
		'copiaCedula',
	];
	for (const key of requiredDocs) {
		const hasFile = Boolean(docFiles[key]) || Boolean(s3.documentos[key]);
		if (!hasFile) {
			fieldErrors[key] = 'Documento obligatorio';
			ok = false;
		}
	}
	return ok;
};

const razonSocialOptions = computed(() =>
	empresas.value.map((e) => ({ label: e.nombre, value: e.external_code }))
);

const selectedEmpresa = computed(
	() => empresas.value.find((e) => e.external_code === form.seccion1.razonSocial) || null
);

const centrosEmpresa = computed(() => {
	const empresa = selectedEmpresa.value;
	if (!empresa) return [] as { external_code: string; nombre: string }[];
	const list: { external_code: string; nombre: string }[] = [];
	for (const uni of empresa.unidades || []) {
		for (const dep of uni.departamentos || []) {
			for (const cc of dep.centros_costo || []) {
				list.push(cc);
			}
		}
	}
	return list;
});

const centroCostoOptions = computed(() =>
	centrosEmpresa.value.map((c) => ({
		label: `${c.external_code} — ${c.nombre}`.trim(),
		value: c.external_code,
	}))
);

const descripcionCentroOptions = computed(() =>
	centrosEmpresa.value.map((c) => ({
		label: c.nombre,
		value: c.external_code,
	}))
);

const obraOptions = computed(() =>
	ubicaciones.value.map((u) => ({
		label: u.nombre,
		value: u.external_code || u.nombre,
	}))
);

const cargoOptions = computed(() =>
	cargos.value.map((c) => ({
		label: c.nombre,
		value: c.nombre || c.external_code,
	}))
);

const tipoCuentaOptions = computed(() => {
	if (maestros.tipos_cuenta?.length) return maestros.tipos_cuenta;
	return maestros.metodos_pago || [];
});

const tiposContratoOptions = computed(() => {
	const list = maestros.tipos_contrato?.length ? maestros.tipos_contrato : TIPO_CONTRATO_OPTIONS;
	return list.filter((o) => String(o.value) !== 'Indefinido');
});

const isCuentaRut = computed(() =>
	String(form.seccion2.metodoPago || '')
		.toLowerCase()
		.replace(/\s+/g, '')
		.includes('cuentarut')
);

const rutBodySinDv = (rut: string) => {
	const clean = String(rut || '').replace(/[^0-9kK]/g, '');
	if (clean.length < 2) return '';
	return clean.slice(0, -1);
};

const applyCuentaRutNumero = () => {
	if (!isCuentaRut.value) return;
	form.seccion2.numeroCuentaBancaria = rutBodySinDv(form.seccion2.rut);
};

const onMetodoPagoChange = () => {
	if (isCuentaRut.value) {
		applyCuentaRutNumero();
		return;
	}
	form.seccion2.numeroCuentaBancaria = '';
};

watch(
	() => form.seccion2.rut,
	() => {
		applyCuentaRutNumero();
	}
);

const isObraFaena = computed(() => form.seccion3.tipoContrato === 'Obra o Faena');
const isPlazoFijo = computed(() => form.seccion3.tipoContrato === 'Plazo Fijo');

const horarioOptions = computed(() => {
	if (horariosEmpresa.value.length) return horariosEmpresa.value;
	return maestros.horarios || [];
});

const showNacionalidadExt = computed(() => {
	const nac = String(form.seccion2.nacionalidad || '');
	return nac === 'Extranjero' || nac === 'Extranjero-Definitiva';
});

const paisNacimientoOptions = computed(() => maestros.paises_region_nacimiento || []);

const regionNacimientoOptions = computed(() => {
	const pais = (maestros.paises_region_nacimiento || []).find(
		(p: any) => p.value === form.seccion2.paisNacimiento
	);
	return pais?.regiones || [];
});

const onPaisNacimientoChange = () => {
	form.seccion2.regionNacimiento = null;
};

const onNacionalidadChange = () => {
	if (!showNacionalidadExt.value) form.seccion2.nacionalidadExt = null;
};

const isEstadoCivilCasado = () => {
	const v = String(form.seccion2.estadoCivil || '').toLowerCase();
	const label = String(
		(maestros.estados_civiles || []).find((o: any) => o.value === form.seccion2.estadoCivil)
			?.label || ''
	).toLowerCase();
	return v.includes('casad') || label.includes('casad');
};

const syncTratamientoPorGeneroYCivil = () => {
	if (form.seccion2.genero === 'F') {
		form.seccion2.tratamiento = isEstadoCivilCasado() ? 'Sra.' : 'Srta.';
		return;
	}
	if (form.seccion2.genero === 'M') {
		form.seccion2.tratamiento = 'Sr.';
	}
};

const onGeneroChange = () => {
	syncTratamientoPorGeneroYCivil();
};

const onEstadoCivilChange = () => {
	if (form.seccion2.genero === 'F') {
		syncTratamientoPorGeneroYCivil();
	}
};

const onTipoContratoChange = () => {
	hitoTexto.value = '';
	plazoFijoFecha.value = null;
	fechaTerminoHito.value = null;
	form.seccion3.diasContrato = null;
};

const resolveTerminoContrato = () => {
	if (isObraFaena.value) return hitoTexto.value.trim() || null;
	if (isPlazoFijo.value) return toDateIso(plazoFijoFecha.value) || null;
	return null;
};

const calcDiasContrato = () => {
	const ingreso = form.seccion1.fechaIngreso;
	const termino = isPlazoFijo.value
		? plazoFijoFecha.value
		: isObraFaena.value
			? fechaTerminoHito.value
			: null;
	if (!(ingreso instanceof Date) || !(termino instanceof Date)) return null;
	const ms = termino.getTime() - ingreso.getTime();
	if (ms <= 0) return null;
	return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const ciudadOptions = computed(() => {
	const region = (maestros.regiones || []).find((r) => r.value === form.seccion2.region);
	return region?.ciudades || [];
});

const comunaOptions = computed(() => {
	const ciudad = ciudadOptions.value.find((c: any) => c.value === form.seccion2.ciudad);
	return ciudad?.comunas || [];
});

const calcEdad = (fecha: Date | null) => {
	if (!fecha) return null;
	const today = new Date();
	let years = today.getFullYear() - fecha.getFullYear();
	const m = today.getMonth() - fecha.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < fecha.getDate())) years -= 1;
	return years;
};

const onFechaNacimientoChange = () => {
	const fecha = form.seccion2.fechaNacimiento;
	if (fecha instanceof Date && fecha > maxFechaNacimiento.value) {
		form.seccion2.fechaNacimiento = maxFechaNacimiento.value;
	}
	form.seccion2.edad = calcEdad(form.seccion2.fechaNacimiento);
};

const clearEmailError = (key: EmailFieldKey) => {
	emailErrors[key] = '';
};

const validateEmailField = async (key: EmailFieldKey, value: string) => {
	emailErrors[key] = '';
	const correo = String(value || '').trim();
	if (!correo) return;

	validatingEmail[key] = true;
	try {
		const response = await SipoService.validarCorreo(correo);
		if (response?.status === 200 && response.data?.valido === false) {
			emailErrors[key] = 'El correo no existe, favor ingresar un correo válido';
		}
	} catch {
		emailErrors[key] = 'No se pudo verificar el correo. Intente nuevamente.';
	} finally {
		validatingEmail[key] = false;
	}
};

// ─── QR Cédula ───────────────────────────────────────────────────────────────
const onCedulaScanned = async (data: CedulaData) => {
	form.seccion2.rut = '';
	form.seccion2.nombres = '';
	form.seccion2.apellidoPaterno = '';
	form.seccion2.apellidoMaterno = '';
	form.seccion2.genero = null;
	form.seccion2.tratamiento = null;
	form.seccion2.nacionalidad = null;
	form.seccion2.fechaNacimiento = null;
	form.seccion2.edad = null;
	rutWarning.value = '';

	const filled: string[] = [];

	if (data.rut) {
		form.seccion2.rut = data.rut;
		filled.push('RUT');
	}
	if (data.nombres && data.nombres.trim().length >= 3) {
		form.seccion2.nombres = formatPersonName(data.nombres);
		filled.push('Nombres');
	}
	if (data.apellidoPaterno && data.apellidoPaterno.trim().length >= 3) {
		form.seccion2.apellidoPaterno = formatPersonName(data.apellidoPaterno);
		filled.push('Primer Apellido');
	}
	if (data.apellidoMaterno && data.apellidoMaterno.trim().length >= 3) {
		form.seccion2.apellidoMaterno = formatPersonName(data.apellidoMaterno);
		filled.push('Segundo Apellido');
	}
	if (data.genero) {
		form.seccion2.genero = normalizeGeneroValue(data.genero);
		filled.push('Género');
		syncTratamientoPorGeneroYCivil();
	}
	if (data.nacionalidad) {
		form.seccion2.nacionalidad = data.nacionalidad;
		filled.push('Nacionalidad');
		if (data.nacionalidad === 'Chile' && !form.seccion2.paisNacimiento) {
			form.seccion2.paisNacimiento = 'Chile';
		}
		onNacionalidadChange();
	}

	if (data.fechaNacimiento) {
		const parts = data.fechaNacimiento.split('-');
		if (parts.length === 3) {
			const fecha = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
			if (!isNaN(fecha.getTime())) {
				if (fecha > maxFechaNacimiento.value) {
					useToastStore().show({
						severity: ToastSeverityMessageEnum.WARN,
						summary: 'Fecha de nacimiento',
						detail: 'La fecha leída indica menor de 18 años. No se cargó; verifícala manualmente.',
						group: ToastGroupEnum.TOP_RIGHT,
						life: 6000,
					});
				} else {
					form.seccion2.fechaNacimiento = fecha;
					form.seccion2.edad = calcEdad(fecha);
					filled.push('Fecha de nacimiento');
				}
			}
		}
	}

	if (data.rut) {
		await onRutBlur();
	}

	const faltantes = missingCedulaFields(data);
	const soloRut = data.soloRut || filled.length <= 1;

	if (faltantes.length && filled.length > 0) {
		useToastStore().show({
			severity: ToastSeverityMessageEnum.WARN,
			summary: 'Cédula parcialmente leída',
			detail: `No se pudo leer con claridad: ${faltantes.join(', ')} (poco legible). Complétalo manualmente.`,
			group: ToastGroupEnum.TOP_RIGHT,
			life: 9000,
		});
		return;
	}

	useToastStore().show({
		severity: soloRut ? ToastSeverityMessageEnum.WARN : ToastSeverityMessageEnum.SUCCESS,
		summary: 'Cédula escaneada',
		detail: soloRut
			? 'El QR de esta cédula solo trae el RUT. Completa nombres, género y fecha manualmente (o escanea PDF417/MRZ si está disponible).'
			: `Se cargaron: ${filled.join(', ')}.`,
		group: ToastGroupEnum.TOP_RIGHT,
		life: soloRut ? 8000 : 5000,
	});
};

const onRutInput = (event: Event) => {
	const target = event.target as HTMLInputElement;
	form.seccion2.rut = filterRutInput(target.value);
	rutWarning.value = '';
};

const onRutBlur = async () => {
	rutWarning.value = '';
	const raw = String(form.seccion2.rut || '').trim();
	if (!raw) return;

	const formatted = formatRut(raw);
	form.seccion2.rut = formatted;

	if (!isValidRut(formatted)) {
		rutWarning.value = 'RUT inválido. Verifique el dígito verificador.';
		return;
	}

	try {
		const response = await SipoService.validarRut(formatted);
		if (response?.status !== 200) {
			rutWarning.value = 'No se pudo verificar el RUT en SAP. Intente nuevamente.';
			return;
		}
		const data = response.data;
		if (data?.activo_ibuilder_sap && data.mensaje) {
			rutWarning.value = data.mensaje;
			useToastStore().show({
				severity: ToastSeverityMessageEnum.WARN,
				summary: 'Alerta',
				detail: data.mensaje,
				life: 9000,
				group: ToastGroupEnum.TOP_RIGHT,
			});
		}
	} catch {
		useToastStore().show({
			severity: ToastSeverityMessageEnum.ERROR,
			summary: 'Validación RUT',
			detail: 'No se pudo verificar el RUT en iBuilder/SAP. Intente nuevamente.',
			life: 6000,
			group: ToastGroupEnum.TOP_RIGHT,
		});
	}
};

const onTelefonoInput = (event: Event) => {
	const target = event.target as HTMLInputElement;
	telefonoLocal.value = target.value.replace(/\D/g, '').slice(0, 8);
	form.seccion2.telefono = telefonoLocal.value
		? `${TELEFONO_PREFIX}${telefonoLocal.value}`
		: '';
};

const soloGrupo2 = (lista: SipoMaestroEmpresa[] | undefined) =>
	(lista || []).filter((e) => e.external_code_pais === EXTERNAL_CODE_PAIS_GRUPO_2);

const loadEmpresas = async (pais?: string) => {
	loadingMaestros.value = true;
	try {
		const response = await SipoService.getMaestros(
			undefined,
			pais || EXTERNAL_CODE_PAIS_GRUPO_2
		);
		if (response?.status === 200) {
			empresas.value = soloGrupo2(response.data?.empresas);
		}
	} finally {
		loadingMaestros.value = false;
	}
};

const loadCargosYObras = async (rut: string) => {
	loadingCargos.value = true;
	try {
		const response = await SipoService.getMaestros(rut, selectedPais.value);
		if (response?.status === 200) {
			const filtradas = soloGrupo2(response.data?.empresas);
			empresas.value = filtradas.length ? filtradas : empresas.value;
			ubicaciones.value = response.data?.ubicaciones ?? [];
			cargos.value = response.data?.cargos ?? [];
		}
	} finally {
		loadingCargos.value = false;
	}
};

const loadCandidatoMaestros = async () => {
	const response = await SipoService.getCandidatoMaestros();
	if (response?.status === 200 && response.data) {
		Object.assign(maestros, response.data);
		if (!cargos.value.length && Array.isArray(response.data.cargos)) {
			cargos.value = response.data.cargos;
		}
	}
};

const onRazonSocialChange = async () => {
	form.seccion1.obra = null;
	form.seccion1.centroCosto = null;
	form.seccion1.descripcionCentroCosto = null;
	form.seccion3.horario = null;
	ubicaciones.value = [];
	cargos.value = [];
	horariosEmpresa.value = [];
	if (!isEditMode.value) {
		selectedPais.value = EXTERNAL_CODE_PAIS_GRUPO_2;
	}
	if (form.seccion1.razonSocial) {
		await Promise.all([
			loadCargosYObras(form.seccion1.razonSocial),
			loadHorariosEmpresa(form.seccion1.razonSocial),
		]);
		const ccOk = centrosEmpresa.value.some(
			(c) => c.external_code === form.seccion1.centroCosto
		);
		if (!ccOk) {
			form.seccion1.centroCosto = null;
			form.seccion1.descripcionCentroCosto = null;
		}
	}
};

const loadHorariosEmpresa = async (empresaId: string) => {
	loadingHorarios.value = true;
	horariosEmpresa.value = [];
	try {
		const response = await SipoConfigCargosService.getHorarios(empresaId);
		if (response?.status === 200) {
			const list = response.data?.horarios || [];
			horariosEmpresa.value = list
				.map((h: any) => {
					const code = String(h.external_code || '').trim();
					const desc = String(h.descripcion || h.detalle || h.horario_trabajo || '').trim();
					if (!code) return null;
					return {
						value: code,
						label: desc ? `${desc} (${code})` : code,
					};
				})
				.filter(Boolean) as { label: string; value: string }[];
		}
	} catch {
		horariosEmpresa.value = [];
	} finally {
		loadingHorarios.value = false;
	}
};

const onCentroCostoChange = () => {
	form.seccion1.descripcionCentroCosto = form.seccion1.centroCosto;
	form.seccion1.jefeUserId = null;
	form.seccion1.jefeNombre = null;
	form.seccion1.jefeCorreo = null;
	void loadJefes();
};

const onJefeChange = () => {
	const uid = String(form.seccion1.jefeUserId || '');
	const item = jefesOptions.value.find((j) => j.user_id === uid);
	form.seccion1.jefeNombre = item?.nombre || null;
	form.seccion1.jefeCorreo = item?.correo || null;
	form.seccion1.correoJefeDirecto = item?.correo || '';
	clearEmailError('correoJefeDirecto');
};

const ensureJefeOption = () => {
	const uid = String(form.seccion1.jefeUserId || '').trim();
	if (!uid) return;
	if (jefesOptions.value.some((j) => j.user_id === uid)) return;
	const nombre = String(form.seccion1.jefeNombre || '').trim();
	const correo = String(form.seccion1.jefeCorreo || '').trim();
	const label = nombre && correo ? `${nombre} (${correo})` : nombre || correo || uid;
	jefesOptions.value = [{ user_id: uid, nombre, correo, label }, ...jefesOptions.value];
};

const loadJefes = async () => {
	const cc = (form.seccion1.centroCosto || '').trim();
	jefesOptions.value = [];
	if (!cc) return;
	loadingJefes.value = true;
	try {
		const response = await SipoService.getPersonalPlanta(cc);
		if (response?.status === 200) jefesOptions.value = response.data || [];
	} finally {
		loadingJefes.value = false;
		ensureJefeOption();
	}
};

const onDescripcionCentroChange = () => {
	form.seccion1.centroCosto = form.seccion1.descripcionCentroCosto;
	form.seccion1.jefeUserId = null;
	form.seccion1.jefeNombre = null;
	form.seccion1.jefeCorreo = null;
	void loadJefes();
};

const onRegionChange = () => {
	form.seccion2.ciudad = null;
	form.seccion2.comuna = null;
};

const onCiudadChange = () => {
	form.seccion2.comuna = null;
};

const onSueldoChange = (value: number | null) => {
	sueldoError.value = '';
	if (value == null) return;
	if (value > SUELDO_MAX) {
		form.seccion3.sueldoLiquido = SUELDO_MAX;
		sueldoError.value = `El sueldo no puede superar $${SUELDO_MAX.toLocaleString('es-CL')}.`;
		return;
	}
	if (value < SUELDO_MIN) {
		sueldoError.value = 'El monto Líquido Pactado no puede ser menor a 585.000 pesos';
	}
};

const onFileSelected = (event: Event, docType: DocKey) => {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	docErrors[docType] = '';
	if (!file) {
		form.seccion3.documentos[docType] = null;
		delete docMeta[docType];
		delete docFiles[docType];
		return;
	}

	const ext = file.name.split('.').pop()?.toLowerCase() || '';
	if (!ALLOWED_EXT.has(ext)) {
		docErrors[docType] = 'Extensión no permitida (pdf, png, jpg, jpeg, webp).';
		input.value = '';
		return;
	}
	const sizeMb = file.size / (1024 * 1024);
	if (sizeMb > MAX_MB) {
		docErrors[docType] = 'No puede subir un archivo que pese más de 4 MB.';
		input.value = '';
		return;
	}

	uploadingDoc.value = docType;
	docMeta[docType] = { name: file.name, sizeMb: sizeMb.toFixed(2) };
	form.seccion3.documentos[docType] = file.name;
	docFiles[docType] = file;
	uploadingDoc.value = null;
};

const formatFechaCl = (value: Date | null) => {
	if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '—';
	return value.toLocaleDateString('es-CL');
};

const formatSueldoPaso = (value: number | null) => {
	if (value == null) return '—';
	return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
};

const toDateIso = (value: Date | null) => {
	if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
	const y = value.getFullYear();
	const m = String(value.getMonth() + 1).padStart(2, '0');
	const d = String(value.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
};

const appendField = (fd: FormData, key: string, value: unknown) => {
	if (value === null || value === undefined || value === '') return;
	fd.append(key, String(value));
};

const labelOf = (options: any[] | undefined, value: unknown) => {
	if (value === null || value === undefined || value === '') return '';
	const found = (options || []).find((o) => String(o.value) === String(value));
	return found?.label || String(value);
};

const buildFichaFormData = (soloSupervisor = false) => {
	const fd = new FormData();
	const s1 = form.seccion1;
	const s2 = form.seccion2;
	const s3 = form.seccion3;
	const cc = centrosEmpresa.value.find((c) => c.external_code === s1.centroCosto);
	const obraSel = ubicaciones.value.find(
		(u) => (u.external_code || u.nombre) === s1.obra
	);

	appendField(fd, 'razon_social_id', s1.razonSocial);
	appendField(fd, 'razon_social_nombre', selectedEmpresa.value?.nombre);
	appendField(fd, 'external_code_pais', isEditMode.value ? selectedPais.value : EXTERNAL_CODE_PAIS_GRUPO_2);
	appendField(fd, 'obra', obraSel?.nombre || s1.obra);
	appendField(fd, 'centro_costo_id', s1.centroCosto);
	appendField(fd, 'centro_costo_nombre', cc?.nombre || s1.descripcionCentroCosto);
	appendField(fd, 'cargo', s1.cargo);
	appendField(fd, 'fecha_ingreso', toDateIso(s1.fechaIngreso));
	appendField(fd, 'correo_jefe_directo', s1.correoJefeDirecto.trim());
	appendField(fd, 'correo_admin_obra', s1.correoAdminObra.trim());
	appendField(fd, 'correo_colaborador', s1.correoColaborador.trim());
	appendField(fd, 'jefe_user_id', s1.jefeUserId);
	appendField(fd, 'jefe_nombre', s1.jefeNombre);
	appendField(fd, 'jefe_correo', s1.jefeCorreo);
	if (soloSupervisor) appendField(fd, 'solo_supervisor', '1');

	appendField(fd, 'nombres', s2.nombres.trim());
	appendField(fd, 'apellido_paterno', s2.apellidoPaterno.trim());
	appendField(fd, 'apellido_materno', s2.apellidoMaterno.trim());
	appendField(fd, 'rut', s2.rut.trim());
	appendField(fd, 'tratamiento', s2.tratamiento);
	appendField(fd, 'genero', s2.genero);
	appendField(fd, 'afp', labelOf(maestros.afps, s2.afp));
	appendField(fd, 'isapre_fonasa', labelOf(maestros.sistemas_salud, s2.isapreFonasa));
	appendField(fd, 'jubilado', s2.jubilado === true ? 'true' : s2.jubilado === false ? 'false' : '');
	appendField(fd, 'estado_civil', labelOf(maestros.estados_civiles, s2.estadoCivil));
	appendField(fd, 'edad', s2.edad);
	appendField(fd, 'fecha_nacimiento', toDateIso(s2.fechaNacimiento));
	appendField(fd, 'pais_nacimiento', s2.paisNacimiento);
	appendField(fd, 'region_nacimiento', s2.regionNacimiento);
	appendField(fd, 'nacionalidad', s2.nacionalidad);
	appendField(fd, 'nacionalidad_ext', showNacionalidadExt.value ? s2.nacionalidadExt : '');
	appendField(fd, 'telefono', s2.telefono.trim());
	appendField(fd, 'domicilio', s2.domicilio.trim());
	appendField(fd, 'villa', s2.villa.trim());
	appendField(fd, 'numero_direccion', s2.numeroDireccion.trim());
	appendField(fd, 'num_depto', s2.numDepto.trim());
	appendField(fd, 'region', labelOf(maestros.regiones, s2.region) || s2.region);
	appendField(fd, 'ciudad', s2.ciudad);
	appendField(fd, 'comuna', s2.comuna);
	appendField(fd, 'email_personal', s2.emailPersonal.trim());
	appendField(fd, 'banco', labelOf(maestros.bancos, s2.banco));
	appendField(fd, 'metodo_pago', labelOf(maestros.metodos_pago, s2.metodoPago) || s2.metodoPago);
	appendField(fd, 'numero_cuenta', s2.numeroCuentaBancaria.trim());

	appendField(fd, 'sueldo_liquido', s3.sueldoLiquido);
	appendField(fd, 'dias_contrato', calcDiasContrato() || s3.diasContrato);
	appendField(fd, 'cuenta_gasto', labelOf(maestros.cuentas_gasto, s3.cuentaGasto) || s3.cuentaGasto);
	appendField(fd, 'tipo_contrato', s3.tipoContrato);
	appendField(fd, 'termino_contrato', resolveTerminoContrato());
	appendField(fd, 'fecha_termino_ito', isObraFaena.value ? toDateIso(fechaTerminoHito.value) : '');
	appendField(fd, 'horario', s3.horario);
	appendField(fd, 'observaciones', s3.observaciones.trim());

	const fileMap: Record<DocKey, string> = {
		comprobanteDomicilio: 'doc_domicilio',
		certificadoTitulo: 'doc_titulo',
		certificadoAfp: 'doc_afp',
		certificadoSalud: 'doc_salud',
		copiaCedula: 'doc_cedula',
	};
	(Object.keys(fileMap) as DocKey[]).forEach((key) => {
		const file = docFiles[key];
		if (file) fd.append(fileMap[key], file);
	});

	return fd;
};

const resetFormAfterSave = () => {
	form.seccion1.razonSocial = null;
	form.seccion1.obra = null;
	form.seccion1.centroCosto = null;
	form.seccion1.descripcionCentroCosto = null;
	form.seccion1.cargo = null;
	form.seccion1.fechaIngreso = null;
	form.seccion1.correoJefeDirecto = '';
	form.seccion1.correoAdminObra = '';
	form.seccion1.correoColaborador = '';
	form.seccion1.jefeUserId = null;
	form.seccion1.jefeNombre = null;
	form.seccion1.jefeCorreo = null;
	jefesOptions.value = [];
	form.seccion2.nombres = '';
	form.seccion2.apellidoPaterno = '';
	form.seccion2.apellidoMaterno = '';
	form.seccion2.rut = '';
	form.seccion2.tratamiento = null;
	form.seccion2.genero = null;
	form.seccion2.afp = null;
	form.seccion2.isapreFonasa = null;
	form.seccion2.jubilado = null;
	form.seccion2.estadoCivil = null;
	form.seccion2.edad = null;
	form.seccion2.fechaNacimiento = null;
	form.seccion2.paisNacimiento = null;
	form.seccion2.regionNacimiento = null;
	form.seccion2.nacionalidad = null;
	form.seccion2.nacionalidadExt = null;
	form.seccion2.telefono = '';
	form.seccion2.domicilio = '';
	form.seccion2.villa = '';
	form.seccion2.numeroDireccion = '';
	form.seccion2.numDepto = '';
	form.seccion2.region = null;
	form.seccion2.ciudad = null;
	form.seccion2.comuna = null;
	form.seccion2.emailPersonal = '';
	form.seccion2.banco = null;
	form.seccion2.metodoPago = null;
	form.seccion2.numeroCuentaBancaria = '';
	form.seccion3.sueldoLiquido = null;
	form.seccion3.diasContrato = null;
	form.seccion3.cuentaGasto = null;
	form.seccion3.tipoContrato = 'Plazo Fijo';
	form.seccion3.horario = null;
	form.seccion3.documentos.comprobanteDomicilio = null;
	form.seccion3.documentos.certificadoTitulo = null;
	form.seccion3.documentos.certificadoAfp = null;
	form.seccion3.documentos.certificadoSalud = null;
	form.seccion3.documentos.copiaCedula = null;
	form.seccion3.observaciones = '';
	hitoTexto.value = '';
	plazoFijoFecha.value = null;
	fechaTerminoHito.value = null;
	telefonoLocal.value = '';
	Object.keys(docFiles).forEach((k) => delete docFiles[k as DocKey]);
	Object.keys(docMeta).forEach((k) => delete docMeta[k]);
	Object.keys(docErrors).forEach((k) => delete docErrors[k]);
};

const validateSupervisor = (): boolean => {
	clearFieldErrors();
	let ok = true;
	const s1 = form.seccion1;
	const s3 = form.seccion3;
	const checks: Array<[string, unknown]> = [
		['cargo', s1.cargo],
		['fechaIngreso', s1.fechaIngreso],
		['correoColaborador', s1.correoColaborador],
		['sueldoLiquido', s3.sueldoLiquido],
		['tipoContrato', s3.tipoContrato],
		['horario', s3.horario],
	];
	for (const [key, value] of checks) {
		if (!markRequired(key, value)) ok = false;
	}
	if (isObraFaena.value) {
		if (!markRequired('hitoTexto', hitoTexto.value)) ok = false;
		if (!markRequired('fechaTerminoHito', fechaTerminoHito.value)) ok = false;
	}
	if (isPlazoFijo.value && !markRequired('plazoFijoFecha', plazoFijoFecha.value)) ok = false;
	return ok;
};

const aplicarDatosColaborador = (ficha: Record<string, any>) => {
	form.seccion2.nombres = ficha.nombres || form.seccion2.nombres;
	form.seccion2.apellidoPaterno = ficha.apellido_paterno || form.seccion2.apellidoPaterno;
	form.seccion2.apellidoMaterno = ficha.apellido_materno || form.seccion2.apellidoMaterno;
	if (ficha.rut) form.seccion2.rut = formatRut(ficha.rut) || ficha.rut;
	if (ficha.email_personal || ficha.correo_colaborador) {
		form.seccion2.emailPersonal = ficha.email_personal || ficha.correo_colaborador;
	}
	if (ficha.telefono) telefonoLocal.value = String(ficha.telefono).replace(/^569/, '');
	if (ficha.domicilio) form.seccion2.domicilio = ficha.domicilio;
};

const detenerPollFicha = () => {
	if (fichaPoll) {
		clearInterval(fichaPoll);
		fichaPoll = null;
	}
};

const generarEnlaceCandidato = async () => {
	onSueldoChange(form.seccion3.sueldoLiquido);
	if (!validateSupervisor()) {
		showObligatoriosToast();
		return;
	}
	generandoQr.value = true;
	global.utl.showLoader();
	try {
		const fd = buildFichaFormData(true);
		const res =
			isEditMode.value && editingId.value
				? await SipoFichasService.update(editingId.value, fd)
				: await SipoFichasService.create(fd);
		if (res?.status !== 200) {
			const detail = (res as any)?.detail || 'No se pudo guardar la ficha.';
			throw { response: { data: { message: detail } } };
		}
		const id = Number(res?.data?.id || editingId.value);
		if (!id) throw new Error('No se pudo guardar la ficha.');
		if (!isEditMode.value) {
			await router.replace({ name: 'SipoFichaIngresoEdit', params: { id: String(id) } });
		}
		const acceso = await SipoFichasService.generarAcceso(id);
		enlaceUrl.value = acceso.data?.url || '';
		enlaceQr.value = acceso.data?.qr_base64 || '';
		paso.value = 'enlace';
		detenerPollFicha();
		fichaPoll = setInterval(async () => {
			const fresh = await SipoFichasService.getById(id);
			const data = fresh?.data as Record<string, any> | undefined;
			if (data?.estado === 'PENDIENTE_RRHH') {
				await fillFormFromFicha(data);
				detenerPollFicha();
				if (isSupervisor.value) {
					global.utl.genCustomeToast(
						ToastSeverityMessageEnum.SUCCESS,
						'Ficha de Ingreso',
						'El colaborador envió sus datos.'
					);
				} else {
					paso.value = 'rrhh';
					global.utl.genCustomeToast(
						ToastSeverityMessageEnum.SUCCESS,
						'Ficha de Ingreso',
						'El colaborador envió sus datos. Completa los datos de RRHH.'
					);
				}
			}
		}, 5000);
	} catch (err: any) {
		const msg = err?.response?.data?.message || err?.response?.data?.detail || 'No se pudo generar el enlace.';
		global.utl.genCustomeToast(ToastSeverityMessageEnum.ERROR, 'Ficha de Ingreso', String(msg));
	} finally {
		generandoQr.value = false;
		global.utl.hiddenLoader();
	}
};

const copiarEnlace = async () => {
	if (!enlaceUrl.value) return;
	await navigator.clipboard.writeText(enlaceUrl.value);
	global.utl.genCustomeToast(ToastSeverityMessageEnum.SUCCESS, 'Ficha de Ingreso', 'Enlace copiado.');
};

onUnmounted(detenerPollFicha);
watch(paso, (value) => {
	if (value !== 'enlace') detenerPollFicha();
});

const enviarAJefe = async () => {
	onSueldoChange(form.seccion3.sueldoLiquido);
	if (isSavingBlocked.value || !validateRequiredFields()) {
		showObligatoriosToast();
		return;
	}
	if (form.seccion2.rut) {
		await onRutBlur();
		if (rutWarning.value) {
			global.utl.genCustomeToast(ToastSeverityMessageEnum.WARN, 'Ficha de Ingreso', rutWarning.value);
			return;
		}
	}
	saving.value = true;
	global.utl.showLoader();
	try {
		const fd = buildFichaFormData();
		const id = editingId.value;
		if (!id) throw new Error('Ficha no encontrada.');
		const res = await SipoFichasService.update(id, fd);
		if (res?.status !== 200) {
			throw { response: { data: { message: (res as any)?.detail || 'No se pudo guardar la ficha.' } } };
		}
		const aprob = await SipoFichasService.aprobar(id);
		if (aprob?.status !== 200) {
			throw { response: { data: { message: (aprob as any)?.detail || 'No se pudo enviar al jefe de terreno.' } } };
		}
		fichaEstado.value = 'PENDIENTE_JEFE_TERRENO';
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.SUCCESS,
			'Ficha de Ingreso',
			'Enviada a confirmación del Jefe de Terreno.'
		);
		await router.push({ name: 'SipoFichaIngresoHistorial' });
	} catch (err: any) {
		const msg = err?.response?.data?.message || err?.response?.data?.detail || 'No se pudo enviar la ficha.';
		global.utl.genCustomeToast(ToastSeverityMessageEnum.ERROR, 'Ficha de Ingreso', String(msg));
	} finally {
		saving.value = false;
		global.utl.hiddenLoader();
	}
};

const onSave = async () => {
	onSueldoChange(form.seccion3.sueldoLiquido);
	if (isSavingBlocked.value) {
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.WARN,
			'Ficha de Ingreso',
			'Corrige los errores del formulario antes de guardar.'
		);
		return;
	}
	if (!validateRequiredFields()) {
		showObligatoriosToast();
		return;
	}
	if (form.seccion2.rut) {
		await onRutBlur();
		if (rutWarning.value) {
			global.utl.genCustomeToast(
				ToastSeverityMessageEnum.WARN,
				'Ficha de Ingreso',
				rutWarning.value
			);
			return;
		}
	}

	saving.value = true;
	global.utl.showLoader();
	try {
		const fd = buildFichaFormData();
		const res =
			isEditMode.value && editingId.value
				? await SipoFichasService.update(editingId.value, fd)
				: await SipoFichasService.create(fd);
		if (res?.status !== 200) {
			const detail =
				(res as any)?.detail ||
				(res as any)?.data?.non_field_errors?.[0] ||
				'No se pudo guardar la ficha.';
			throw { response: { data: { message: detail } } };
		}
		clearFieldErrors();
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.SUCCESS,
			'Ficha de Ingreso',
			isEditMode.value ? 'Cambios guardados correctamente.' : 'Ficha guardada correctamente.'
		);
		if (!isEditMode.value) resetFormAfterSave();
		await router.push({ name: 'SipoFichaIngresoHistorial' });
	} catch (err: any) {
		const msg =
			err?.response?.data?.message ||
			err?.response?.data?.detail ||
			err?.response?.data?.data?.non_field_errors?.[0] ||
			'No se pudo guardar la ficha.';
		global.utl.genCustomeToast(ToastSeverityMessageEnum.ERROR, 'Ficha de Ingreso', String(msg));
	} finally {
		saving.value = false;
		global.utl.hiddenLoader();
	}
};

const openDocumento = async (url?: string) => {
	if (!url) return;
	try {
		const response = await axios.get(url, { responseType: 'blob' });
		if (response?.status && Number(response.status) >= 400) throw new Error('HTTP error');
		const contentType = String(response.headers['content-type'] || 'application/octet-stream');
		const blobUrl = URL.createObjectURL(new Blob([response.data], { type: contentType }));
		window.open(blobUrl, '_blank', 'noopener,noreferrer');
		window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
	} catch {
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.ERROR,
			'Documento',
			'No se pudo abrir el documento adjunto.'
		);
	}
};

const onPrint = () => {
	window.print();
};

const parseDateValue = (value: unknown): Date | null => {
	if (!value) return null;
	if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
	const text = String(value).trim().slice(0, 10);
	const m = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return null;
	const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
	return Number.isNaN(d.getTime()) ? null : d;
};

const fileNameFromUrl = (url: unknown) => {
	const text = String(url || '');
	if (!text) return '';
	try {
		const path = text.split('?')[0];
		const name = path.split('/').pop() || '';
		return decodeURIComponent(name);
	} catch {
		return '';
	}
};

const applyExistingDocMeta = (ficha: Record<string, any>) => {
	const map: Record<DocKey, { field: string; url: string }> = {
		comprobanteDomicilio: { field: 'doc_domicilio', url: 'doc_domicilio_url' },
		certificadoTitulo: { field: 'doc_titulo', url: 'doc_titulo_url' },
		certificadoAfp: { field: 'doc_afp', url: 'doc_afp_url' },
		certificadoSalud: { field: 'doc_salud', url: 'doc_salud_url' },
		copiaCedula: { field: 'doc_cedula', url: 'doc_cedula_url' },
	};
	(Object.keys(map) as DocKey[]).forEach((key) => {
		const stored = String(ficha[map[key].field] || '').split('/').filter(Boolean).pop() || '';
		const name = stored || fileNameFromUrl(String(ficha[map[key].url] || '').replace(/\/+$/, ''));
		if (name) {
			docMeta[key] = {
				name: `Actual: ${name}`,
				sizeMb: '',
				url: String(ficha[map[key].url] || '') || undefined,
			};
			form.seccion3.documentos[key] = name;
			delete fieldErrors[key];
		}
	});
};

const fillFormFromFicha = async (ficha: Record<string, any>) => {
	selectedPais.value = EXTERNAL_CODE_PAIS_GRUPO_2;
	await loadEmpresas(EXTERNAL_CODE_PAIS_GRUPO_2);
	form.seccion1.razonSocial = ficha.razon_social_id || null;
	if (form.seccion1.razonSocial) {
		await Promise.all([
			loadCargosYObras(form.seccion1.razonSocial),
			loadHorariosEmpresa(form.seccion1.razonSocial),
		]);
	}

	const obraRaw = String(ficha.obra || '').trim();
	const obraMatch = ubicaciones.value.find(
		(u) => u.nombre === obraRaw || u.external_code === obraRaw
	);
	form.seccion1.obra = obraMatch ? obraMatch.external_code || obraMatch.nombre : obraRaw || null;
	form.seccion1.centroCosto = ficha.centro_costo_id || null;
	form.seccion1.descripcionCentroCosto = ficha.centro_costo_id || null;
	form.seccion1.cargo = ficha.cargo || null;
	form.seccion1.fechaIngreso = parseDateValue(ficha.fecha_ingreso);
	form.seccion1.correoJefeDirecto = ficha.correo_jefe_directo || '';
	form.seccion1.correoAdminObra = ficha.correo_admin_obra || '';
	form.seccion1.correoColaborador = ficha.correo_colaborador || '';
	form.seccion1.jefeUserId = ficha.jefe_user_id || null;
	form.seccion1.jefeNombre = ficha.jefe_nombre || null;
	form.seccion1.jefeCorreo = ficha.jefe_correo || null;
	await loadJefes();

	form.seccion2.nombres = ficha.nombres || '';
	form.seccion2.apellidoPaterno = ficha.apellido_paterno || '';
	form.seccion2.apellidoMaterno = ficha.apellido_materno || '';
	form.seccion2.rut = formatRut(ficha.rut || '') || ficha.rut || '';
	form.seccion2.tratamiento = ficha.tratamiento || null;
	form.seccion2.genero = normalizeGeneroValue(ficha.genero);
	form.seccion2.afp = findOptionValue(maestros.afps, ficha.afp);
	form.seccion2.isapreFonasa = findOptionValue(maestros.sistemas_salud, ficha.isapre_fonasa);
	form.seccion2.jubilado = Boolean(ficha.jubilado);
	form.seccion2.estadoCivil = findOptionValue(maestros.estados_civiles, ficha.estado_civil);
	form.seccion2.edad = ficha.edad != null ? Number(ficha.edad) : null;
	form.seccion2.fechaNacimiento = parseDateValue(ficha.fecha_nacimiento);
	form.seccion2.paisNacimiento =
		findOptionValue(maestros.paises_region_nacimiento, ficha.pais_nacimiento) ||
		ficha.pais_nacimiento ||
		null;
	form.seccion2.regionNacimiento = ficha.region_nacimiento || null;
	form.seccion2.nacionalidad =
		findOptionValue(maestros.nacionalidades, ficha.nacionalidad) || ficha.nacionalidad || null;
	form.seccion2.nacionalidadExt =
		findOptionValue(maestros.nacionalidades_extranjeras, ficha.nacionalidad_ext) ||
		ficha.nacionalidad_ext ||
		null;
	const tel = String(ficha.telefono || '');
	if (tel.startsWith(TELEFONO_PREFIX)) {
		telefonoLocal.value = tel.slice(TELEFONO_PREFIX.length);
		form.seccion2.telefono = tel;
	} else {
		telefonoLocal.value = tel.replace(/\D/g, '').slice(-8);
		form.seccion2.telefono = tel;
	}
	form.seccion2.domicilio = ficha.domicilio || '';
	form.seccion2.villa = ficha.villa || '';
	form.seccion2.numeroDireccion = ficha.numero_direccion || '';
	form.seccion2.numDepto = ficha.num_depto || '';
	form.seccion2.region =
		findOptionValue(maestros.regiones, ficha.region) || ficha.region || null;
	form.seccion2.ciudad = ficha.ciudad || null;
	form.seccion2.comuna = ficha.comuna || null;
	form.seccion2.emailPersonal = ficha.email_personal || ficha.correo_colaborador || '';
	form.seccion2.banco = findOptionValue(maestros.bancos, ficha.banco);
	form.seccion2.metodoPago =
		findOptionValue(maestros.metodos_pago, ficha.metodo_pago) ||
		findOptionValue(maestros.tipos_cuenta, ficha.metodo_pago) ||
		ficha.metodo_pago ||
		null;
	form.seccion2.numeroCuentaBancaria = ficha.numero_cuenta || '';

	form.seccion3.sueldoLiquido =
		ficha.sueldo_liquido != null ? Number(ficha.sueldo_liquido) : null;
	form.seccion3.diasContrato =
		ficha.dias_contrato != null ? Number(ficha.dias_contrato) : null;
	form.seccion3.cuentaGasto =
		findOptionValue(maestros.cuentas_gasto, ficha.cuenta_gasto) || ficha.cuenta_gasto || null;
	form.seccion3.tipoContrato = ficha.tipo_contrato || 'Plazo Fijo';
	form.seccion3.horario =
		findOptionValue(horarioOptions.value, ficha.horario) ||
		findOptionValue(maestros.horarios, ficha.horario) ||
		ficha.horario ||
		null;
	form.seccion3.observaciones = ficha.observaciones || '';

	if (form.seccion3.tipoContrato === 'Obra o Faena') {
		hitoTexto.value = ficha.termino_contrato || '';
		fechaTerminoHito.value = parseDateValue(ficha.fecha_termino_ito);
		plazoFijoFecha.value = null;
	} else {
		plazoFijoFecha.value = parseDateValue(ficha.termino_contrato);
		hitoTexto.value = '';
		fechaTerminoHito.value = null;
	}

	applyExistingDocMeta(ficha);
	onSueldoChange(form.seccion3.sueldoLiquido);
	fichaEstado.value = String(ficha.estado || '');
	if (isSupervisor.value) {
		if (
			fichaEstado.value === 'PENDIENTE_RRHH'
			|| fichaEstado.value === 'PENDIENTE_JEFE_TERRENO'
			|| fichaEstado.value === 'APROBADA'
			|| fichaEstado.value === 'RECHAZADA'
		) {
			paso.value = 'colaborador';
		} else if (editingId.value) {
			paso.value = 'enlace';
		} else {
			paso.value = 'supervisor';
		}
		return;
	}
	if (
		fichaEstado.value === 'PENDIENTE_RRHH'
		|| fichaEstado.value === 'PENDIENTE_JEFE_TERRENO'
		|| fichaEstado.value === 'APROBADA'
		|| fichaEstado.value === 'RECHAZADA'
	) {
		paso.value = 'rrhh';
	} else if (editingId.value) {
		paso.value = 'enlace';
	}
};

const loadFichaForEdit = async () => {
	if (!editingId.value) return;
	const res = await SipoFichasService.getById(editingId.value);
	if (Number(res?.status) !== 200 || !res.data) {
		throw new Error((res as any)?.detail || 'No se pudo cargar la ficha.');
	}
	const ficha = res.data as Record<string, any>;
	const estado = String(ficha.estado || '').toUpperCase();
	if (estado === 'APROBADA' || estado === 'FINALIZADA') {
		global.utl.genCustomeToast(
			ToastSeverityMessageEnum.WARN,
			'Ficha de Ingreso',
			'La ficha no puede modificarse porque ya fue aprobada o finalizada.'
		);
		await router.push({ name: 'SipoFichaIngresoHistorial' });
		return;
	}
	await fillFormFromFicha(ficha);
	if (paso.value === 'enlace' && editingId.value) {
		const id = editingId.value;
		const acceso = await SipoFichasService.generarAcceso(id);
		enlaceUrl.value = acceso.data?.url || '';
		enlaceQr.value = acceso.data?.qr_base64 || '';
		detenerPollFicha();
		fichaPoll = setInterval(async () => {
			const fresh = await SipoFichasService.getById(id);
			const data = fresh?.data as Record<string, any> | undefined;
			if (data?.estado === 'PENDIENTE_RRHH') {
				await fillFormFromFicha(data);
				detenerPollFicha();
				if (!isSupervisor.value) {
					paso.value = 'rrhh';
				}
			}
		}, 5000);
	}
};

onMounted(async () => {
	global.utl.showLoader();
	try {
		selectedPais.value = EXTERNAL_CODE_PAIS_GRUPO_2;
		await Promise.all([
			loadEmpresas(EXTERNAL_CODE_PAIS_GRUPO_2),
			loadCandidatoMaestros(),
		]);
		if (isEditMode.value) {
			await loadFichaForEdit();
		}
	} catch {
		global.utl.genToast(global.tstType.SERVER_ERROR);
		if (isEditMode.value) {
			await router.push({ name: 'SipoFichaIngresoHistorial' });
		}
	} finally {
		global.utl.hiddenLoader();
	}
});
</script>

<style scoped>
.sipo-ficha-ingreso {
	min-width: 0;
}

.ficha-logo-grupo {
	display: block;
	height: 2.55rem;
	width: auto;
	max-width: min(16.5rem, 100%);
	object-fit: contain;
	border-radius: 6px;
}

.ficha-section__title {
	margin: 0 0 1rem;
	font-size: 0.95rem;
	font-weight: 700;
	text-transform: uppercase;
	color: #252527;
	border-bottom: 2px solid #dc2626;
	padding-bottom: 0.35rem;
}

.ficha-subsection__title {
	margin: 0 0 0.75rem;
	font-size: 0.85rem;
	font-weight: 700;
	text-transform: uppercase;
	color: #374151;
}

.telefono-input-group {
	border: 1px solid var(--surface-border);
	border-radius: 6px;
	overflow: hidden;
	background: var(--surface-0);
}

.telefono-prefix {
	display: inline-flex;
	align-items: center;
	padding: 0 0.75rem;
	background: var(--surface-100);
	color: var(--text-color-secondary);
	font-size: 0.875rem;
	font-weight: 600;
	border-right: 1px solid var(--surface-border);
	user-select: none;
}

.telefono-input-group :deep(.telefono-input) {
	border: none;
	border-radius: 0;
	box-shadow: none;
}

@media print {
	.no-print {
		display: none !important;
	}

	.ficha-print-area {
		padding: 0 !important;
	}

	.ficha-section {
		break-inside: avoid;
		page-break-inside: avoid;
	}
}
</style>
